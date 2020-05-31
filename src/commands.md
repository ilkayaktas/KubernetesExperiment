#### Build Docker Image
```bash
docker build -t ilkayaktas/simple_webserver .
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



#### Kubernetes Cluster Info

```bash
kubectl cluster-info
```



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



#### Liveness Probe

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
  livenessProbe:     # A liveness probe that will perform an tcp socket connection
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

