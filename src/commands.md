#### Build Docker Image
```bash
docker build -t ilkayaktas/simple_webserver .

docker build -t ilkayaktas/simple_webserver:1.0 -t ilkayaktas/simple_webserver:latest .
```



#### Run Docker Container
```bash
docker run --name simple_webserver -p 8088:8088 -d ilkayaktas/simple_webserver
```



#### Docker Process Snapshot
```bash
docker ps
```



#### Explore Running Container
```bash
docker exec -it simple_webserver bash
```



#### Push Image to Dockerhub
```bash
docker login
docker push ilkayaktas/simple_webserver
```



#### Kubectl Configuration

You can control kubernetes cluster from your local computer. 

- Install kubectl.

- Go to kubernetes master cluster and copy file content of **/etc/kubernetes/admin.conf**

- Come back to your local machine. Paste content into **~/.kube/config**

- Now, you can control kubernetes cluster from your local computer.

  

#### Kubernetes Cluster Info

```bash
kubectl cluster-info
```



#### Deploy Dashboard UI

```
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.0.0/aio/deploy/recommended.yaml
```

You can access Dashboard using the kubectl command-line tool by running the following command:

```
kubectl proxy
```

Kubectl will make Dashboard available at http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/.

The UI can only be accessed from the machine where the command is executed. See kubectl proxy --help for more options.



#### List Nodes
```bash
kubectl get nodes

NAME                STATUS   ROLES    AGE   VERSION
kubernetes-master   Ready    master   36d   v1.17.4
kubernetes-node1    Ready    <none>   36d   v1.17.4
kubernetes-node2    Ready    <none>   36d   v1.17.4 
```



#### Enable Auto Completion

```bash
sudo apt install bash-completion
source <(kubectl completion bash) #### add this line to .bashrc

```



#### Create Pod in CLI

```bash
kubectl run simple-webserver --image=ilkayaktas/simple_webserver --port=8088 --generator=run-pod/v1

pod/simple-webserver created
```



#### Expose Pod as Service

```bash
kubectl expose pod simple-webserver --type=LoadBalancer --name=simple-webserver-http
```



#### List Services

```bash
kubectl get service

NAME                    TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
kubernetes              ClusterIP      10.233.0.1     <none>        443/TCP          36d
simple-webserver-http   LoadBalancer   10.233.27.99   <pending>     8088:30338/TCP   112s

curl 10.233.27.99:8088
My hostname is simple-webserver
curl localhost:8088
curl: (7) Failed to connect to localhost port 8088: Connection refused
```

In host machine open a browser and enter one of them:

http://192.168.56.101:30338/

http://192.168.56.102:30338/

http://192.168.56.103:30338/

My hostname is simple-webserver

You can also check Service as below

``` 
kubectl exec simple-webserver -- curl -s 10.233.27.99
```

#### Service Discovery

Each service information is located under pod environment variable. If pods are created before service, you should kill pods and restart again.

``` 
kubectl exec iaktas-replicaset-t6xgs env

PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=iaktas-replicaset-t6xgs
IAKTAS_SERVICE_PORT_80_TCP_PROTO=tcp
KUBERNETES_SERVICE_HOST=10.233.0.1   // Kubernetes service
KUBERNETES_PORT_443_TCP_PROTO=tcp
KUBERNETES_PORT_443_TCP_PORT=443
IAKTAS_SERVICE_PORT_80_TCP_ADDR=10.233.30.112
KUBERNETES_SERVICE_PORT=443
KUBERNETES_SERVICE_PORT_HTTPS=443
IAKTAS_SERVICE_SERVICE_HOST=10.233.30.112    // iaktas_service
IAKTAS_SERVICE_PORT=tcp://10.233.30.112:80
KUBERNETES_PORT_443_TCP_ADDR=10.233.0.1
IAKTAS_SERVICE_SERVICE_PORT=80
IAKTAS_SERVICE_PORT_80_TCP=tcp://10.233.30.112:80
IAKTAS_SERVICE_PORT_80_TCP_PORT=80
KUBERNETES_PORT=tcp://10.233.0.1:443
KUBERNETES_PORT_443_TCP=tcp://10.233.0.1:443
NODE_VERSION=14.5.0
YARN_VERSION=1.22.4
HOME=/root
```

Dashes in the service name are converted to underscores and all letters are uppercased when the service name is used as the prefix in the environment variable’s name.

#### Service Endpoints

An Endpoints resource (yes, plural) is a list of IP addresses and ports exposing a service. When a client connects to a service, the service proxy selects one of those IP and port pairs and redirects the incoming connection to the server listening at that location.

```
kubectl describe svc iaktas-service -n iaktas

Name:              iaktas-service
Namespace:         iaktas
Labels:            app=iaktas
Annotations:       kubectl.kubernetes.io/last-applied-configuration:
                     {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"labels":{"app":"iaktas"},"name":"iaktas-service","namespace":"iaktas"},"...
Selector:          app=iaktas-rs
Type:              ClusterIP
IP:                10.233.30.112
Port:              <unset>  80/TCP
TargetPort:        8088/TCP
Endpoints:         10.233.69.61:8088,10.233.69.62:8088,10.233.73.30:8088 	// These are endpoints
Session Affinity:  None
Events:            <none>

```

```
kubectl get endpoints -n iaktas

NAME             ENDPOINTS                                               AGE
iaktas-service   10.233.69.61:8088,10.233.69.62:8088,10.233.73.30:8088   76m

```

If you create a service without a pod selector, Kubernetes won’t even create the Endpoints resource (after all, without a selector, it can’t know which pods to include in the service).

#### Deploy an Application as Replication Controller (Deprecated), Access from outside and create replication

```bash
kubectl run tmp-webserver --image=ilkayaktas/simple_webserver --port=8088 --generator=run/v1
kubectl expose rc tmp-webserver --type=LoadBalancer --name=tmp-webserver-http
kubectl scale rc tmp-webserver --replicas=3

curl http://192.168.56.101:31895/
My hostname is tmp-webserver-6rkgm
curl http://192.168.56.101:31895/
My hostname is tmp-webserver-2f78c
curl http://192.168.56.101:31895/
My hostname is tmp-webserver-v9lr6
curl http://192.168.56.101:31895/
My hostname is tmp-webserver-6rkgm
curl http://192.168.56.101:31895/
My hostname is tmp-webserver-2f78c
curl http://192.168.56.101:31895/
My hostname is tmp-webserver-v9lr6
```

Requests are hitting different pods randomly. This is what services in Kubernetes do
when more than one pod instance backs them. They act as a load balancer standing in
front of multiple pods. When there’s only one pod, services provide a static address
for the single pod. Whether a service is backed by a single pod or a group of pods,
those pods come and go as they’re moved around the cluster, which means their IP
addresses change, but the service is always there at the same address. This makes it
easy for clients to connect to the pods, regardless of how many exist and how often
they change location.



#### Details of Pod (Node, IP etc)

```bash
kubectl describe pod tmp-webserver-6rkgm
```



#### List Pods

```bash
kubectl get pods --all-namespaces
kubectl get pods -n kube-system
```



#### Run Command in Pods (Ping, ifconfig etc)

```bash
kubectl get pods -o wide

NAME                  READY   STATUS    RESTARTS   AGE     IP            NODE               NOMINATED NODE   READINESS GATES
simple-webserver      1/1     Running   0          3h59m   10.233.69.5   kubernetes-node1   <none>           <none>
tmp-webserver-2f78c   1/1     Running   0          46m     10.233.69.7   kubernetes-node1   <none>           <none>
tmp-webserver-6rkgm   1/1     Running   0          46m     10.233.73.5   kubernetes-node2   <none>           <none>
tmp-webserver-v9lr6   1/1     Running   0          54m     10.233.69.6   kubernetes-node1   <none>           <none>
```
```bash
kubectl exec simple-webserver -- ifconfig #### shows ifconfig output
kubectl exec simple-webserver -- ping 10.233.69.7 #### ping to 10.233.69.7
kubectl exec simple-webserver -- ping tmp-webserver-2f78c #### FAILS. Doesn't ping to tmp-webserver-2f78c
```



#### Get YAML of a Deployed Pod

```bash
kubectl get pods simple-webserver -o yaml
```



#### Creating Pod from YAML

```bash
kubectl create -f simple_webserver.yaml
```



#### Applying Changes from YAML

Apply a configuration to a resource by filename or stdin. **The resource name must be specified**. This resource will be created if it doesn't exist yet. To use 'apply', always create the resource initially with either 'apply' or 'create --save-config'. 

If resource name exists, it's updated. If resource name doesn't exist, it's created.

```bash
kubectl apply -f simple_webserver.yaml
```

Most of the attributes of a [PodSpec](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.15/#podspec-v1-core) cannot be changed once the pod has been created. The port information is inside the `containers` array, and the linked documentation explicitly notes that `containers` "Cannot be updated." You *must* delete and recreate the pod if you want to change the ports it makes visible (or most of its other properties); there is no other way to do it.



#### Delete Pod

```bash
kubectl delete pod simple-webserver-manual1
```



#### Retrieving Logs

```bash
ssh iaktas@node3
docker logs  <container id>
```

```bash
kubectl logs simple-webserver

Simple web server starting...
Received request from ::ffff:10.233.116.0
Received request from ::ffff:10.233.116.0
```

```bash
# Get logs of specific container in a pod
kubectl logs tmp-webserver-6rkgm -c tmp-webserver

kubectl logs mypod --previous # Get previous containers logs
```



#### Port Forwarding for Debug/Test Purpose

```bash
kubectl port-forward simple-webserver-manual1 9876:4567
```

First port is local machine port, second one is pod port.



#### Get Pods wrt Labels

```bash
kubectl get pods --show-labels

NAME                       READY   STATUS    RESTARTS   AGE   LABELS
simple-webserver           1/1     Running   2          30h   run=simple-webserver
simple-webserver-manual1   1/1     Running   0          24m   newby=simple-webserver-manual-newby,run=simple-webserver-manual
```

```bash
// List label keys in different column 
kubectl get pods -L run,newby

NAME                       READY   STATUS    RESTARTS   AGE   RUN                       NEWBY
simple-webserver           1/1     Running   2          30h   simple-webserver          
simple-webserver-manual1   1/1     Running   0          27m   simple-webserver-manual   simple-webserver-manual-newby
tmp-webserver-2f78c        1/1     Running   2          27h   tmp-webserver             
tmp-webserver-6rkgm        1/1     Running   2          27h   tmp-webserver             
tmp-webserver-v9lr6        1/1     Running   2          27h   tmp-webserver             
```



#### Modify Labels

```bash
kubectl label pods simple-webserver newby=new-added-label
```

```bash
// If label key exists, overwrite it 
kubectl label pods simple-webserver newby=verynew-added-label --overwrite
```



#### Filter wrt Label 

```bash
kubectl get pods -l newby --show-labels

NAME                       READY   STATUS    RESTARTS   AGE   LABELS
simple-webserver           1/1     Running   2          31h   newby=new-added-label,run=simple-webserver
simple-webserver-manual1   1/1     Running   0          33m   newby=simple-webserver-manual-newby,run=simple-webserver-manual
```



```bash
kubectl get pods -L run,newby -l run,newby

NAME                       READY   STATUS    RESTARTS   AGE   RUN                       NEWBY
simple-webserver           1/1     Running   2          31h   simple-webserver          new-added-label
simple-webserver-manual1   1/1     Running   0          34m   simple-webserver-manual   simple-webserver-manual-newby
```



```bash
kubectl get pods -L run,newby -l run=tmp-webserver

NAME                  READY   STATUS    RESTARTS   AGE   RUN             NEWBY
tmp-webserver-2f78c   1/1     Running   2          27h   tmp-webserver   
tmp-webserver-6rkgm   1/1     Running   2          27h   tmp-webserver   
tmp-webserver-v9lr6   1/1     Running   2          27h   tmp-webserver   
```



```bash
kubectl get pods -L run,newby -l '!newby'

NAME                  READY   STATUS    RESTARTS   AGE   RUN             NEWBY
tmp-webserver-2f78c   1/1     Running   2          27h   tmp-webserver   
tmp-webserver-6rkgm   1/1     Running   2          27h   tmp-webserver   
tmp-webserver-v9lr6   1/1     Running   2          28h   tmp-webserver   
```



#### Label Selector

Deploy any pod to specific node as below.

```yaml
apiVersion: v1
kind: Pod
  metadata:
    name: kubia-gpu
spec:
  nodeSelector:
    gpu: "true"
```



#### List Namespaces

```bash
kubectl get namespaces

NAME              STATUS   AGE
default           Active   7h33m
kube-node-lease   Active   7h33m
kube-public       Active   7h33m
kube-system       Active   7h33m
```

```bash
kubectl get pods --namespace kube-system
```



#### Create Namespaces

```bash
kubectl create namespace simple-namespaces-manual
```

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: simple-namespace
```



#### Add Pod to Namespaces

```bash
kubectl create -f create_pod.yaml -n custom-namespace
```

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: simple-webserver
  namespace: simple-namespace
```



#### Delete Pod

```bash
kubectl delete pod simple-webserver-manual1

kubectl deleted pod --
```



#### Delete Pod by Label Selector

```bash
kubectl delete pods -l creation_method=manual
```



#### Delete Pod by Namespace

```bash
kubectl delete namespaces simple-namespace # Delete namespaces and all its pods

kubectl delete pod --all -n simple-namespaces-manual # Delete all pods in namespace
```



#### Delete All Resources - DANGER ZONE

```bash
kubectl delete all --all # Think twice before you run this command. 
```



#### Liveness Probe / Readiness Probe

Readiness probes are configured similarly to liveness probes. The only difference is that you use the `readinessProbe` field instead of the `livenessProbe` field.

```yaml
spec:
  containers:
    - name: simple_webserver_unhealthy
      image: ilkayaktas/simple_webserver_unhealthy:latest
      ports:
        - containerPort: 8088
          protocol: TCP
      livenessProbe:     # A liveness probe that will perform an HTTP GET
        httpGet:				 # The probe is considered successful if response code is 2xx or 3xx 
          path: /        # The path to request in the HTTP request
          port: 8088     # The network port the probe should connect to
        initialDelaySeconds: 15
        periodSeconds: 20          
```

```yaml
  readinessProbe:     # A readiness probe that will perform an tcp socket connection
    tcpSocket:				  # The probe is considered successful if open a TCP connection to the specified port of the container
      port: 8088     # The network port the probe should connect to
    initialDelaySeconds: 15
    periodSeconds: 20
```
```yaml
  livenessProbe:     # A liveness probe that will perform an exec
    exec:				     # The probe is considered successful if executes an arbitrary command inside the container and checks the command’s exit status code. If the status code is 0 
      command:
      - cat
      - /tmp/healthy
      
```


#### Create ReplicaSet

```bash
kubectl apply -f create_replicaset.yaml

kubectl get rs

NAME                          DESIRED   CURRENT   READY   AGE
simple-webserver-replicaset   3         3         3       118s
```



#### Deleting ReplicaSet

```bash
kubectl delete rs simple-webserver-replicaset # Deletes also pods created by this replicaset
```



#### Creating DeomanSet

```bash
kubectl apply -f create_deamonset.yaml

kubectl get ds

NAME         DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
log-deamon   2         2         2       2            2           <none>          24s
```

#### DeletingDeamonSet

```bash
kubectl delete ds log-deamon # Deletes also pods created by this deamonset
```



#### Create Job

```bash
kubectl apply -f create_job.yaml
```



```bash
kubectl get pods
NAME               READY   STATUS      RESTARTS   AGE
simple-job-tpzs7   0/1     Completed   0          33s

kubectl get jobs
NAME         COMPLETIONS   DURATION   AGE
simple-job   1/1           29s        37s
```



#### Create Deployment

```bash
kubectl apply -f create_deployment.yaml --record # record is necessary if you want to see history

kubectl get deploy # list deployment
NAME                READY   UP-TO-DATE   AVAILABLE   AGE
simple-deployment   3/3     3            3           101s

kubectl get rs  # list replicaset
NAME                           DESIRED   CURRENT   READY   AGE
simple-deployment-7bf6c68fdb   3         3         3       111s

kubectl get pods # list pods
NAME                                 READY   STATUS    RESTARTS   AGE
simple-deployment-7bf6c68fdb-8fd78   1/1     Running   0          2m5s
simple-deployment-7bf6c68fdb-9d5p9   1/1     Running   0          2m5s
simple-deployment-7bf6c68fdb-gnr9q   1/1     Running   0          2m5s
```



#### Deployment Status

```bash
kubectl rollout status deployment simple-deployment

Waiting for rollout to finish: 2 out of 3 new replicas have been updated.
deployment "simple-deployment" successfully rolled out
```



#### Patch Deployment

```bash
kubectl patch deployment simple-deloyment -p '{"spec": {"minReadySeconds": 10}}'
```

The kubectl patch command is useful for modifying a single property or a limited number of properties of a resource without having to edit its defi- nition in a text editor.

#### Cyclic Rest Request

```bash
while true; do curl http://192.168.56.101:32712; sleep 1; done
```



#### Rolling Update

To trigger the actual rollout, you’ll change the image used in the single pod container to new version. Instead of editing the whole YAML of the Deployment object or using the patch command to change the image, you’ll use the kubectl set image command, which allows changing the image of any resource that contains a container (ReplicationControllers, ReplicaSets, Deployments, and so on). 

```bash
kubectl set image deployment simple-deployment simple-webserver-deployment=ilkayaktas/simple_webserver_update:latest
```

By changing the pod template in your Deployment resource, you’ve updated your app to a newer version—by changing a single field!

You can update your version by updating the `yaml` file and than `kubectl apply`.

Deployment ensures that only a certain number of Pods are down while they are being updated. By default, it ensures that at least 75% of the desired number of Pods are up (25% max unavailable).

Deployment also ensures that only a certain number of Pods are created above the desired number of Pods. By default, it ensures that at most 125% of the desired number of Pods are up (25% max surge).



#### Rollout History

```bash
kubectl rollout history deployment simple-deployment

kubectl rollout history deployment simple-deployment --revision=2
```



#### Rollback To Specific Version

```bash
kubectl rollout undo deployment simple-deployment

kubectl rollout undo deployment simple-deployment --to-revision=1
```



#### Pause-Resume Rollout

```bash
kubectl rollout pause deployment simple-deployment

kubectl rollout resume deployment simple-deployment
```

You can pause a Deployment before triggering one or more updates and then resume it. Behaves live canary updates.



#### Scaling Deployment

```bash
kubectl scale deployment simple-deployment --replicas=5
```



#### **Autoscaling Deployment**

```shell
kubectl autoscale deployment simple-deployment --min=5 --max=15 --cpu-percent=80
```

When POD cpu usage exceed %80, new pod is created until 15 Pods.