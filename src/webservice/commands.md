#### Build docker image
```
docker build -t ilkayaktas/simple_webserver .
```



#### Run docker container
```
docker run --name simple_webserver -p 8088:8088 -d ilkayaktas/simple_webserver
```



#### Docker process snapshot
```
docker ps
```



#### Explore running container
```
docker exec -it simple_webserver bash
```



#### Push image to dockerhub
```
docker login
docker push ilkayaktas/simple_webserver
```



#### Kubernetes cluster info

```
kubectl cluster-info
```



#### Kubernetes list nodes
```
kubectl get nodes

NAME                STATUS   ROLES    AGE   VERSION
kubernetes-master   Ready    master   36d   v1.17.4
kubernetes-node1    Ready    <none>   36d   v1.17.4
kubernetes-node2    Ready    <none>   36d   v1.17.4 
```



#### To enable bash completion

```
sudo apt install bash-completion
source <(kubectl completion bash) #### add this line to .bashrc

```



#### Deploy an application from dockerhub (deploy as pod, not replication controller)

```
kubectl run simple-webserver --image=ilkayaktas/simple_webserver --port=8088 --generator=run-pod/v1

pod/simple-webserver created
```



#### Access pod from outside. (expose pod, not replication controller)

```
kubectl expose pod simple-webserver --type=LoadBalancer --name=simple-webserver-http

#### 
```



#### Check exposed service

```
kubectl get service

NAME                    TYPE           CLUSTER-IP     EXTERNAL-IP   PORT(S)          AGE
kubernetes              ClusterIP      10.233.0.1     <none>        443/TCP          36d
simple-webserver-http   LoadBalancer   10.233.27.99   <pending>     8088:30338/TCP   112s

curl 10.233.27.99:8088
My hostname is simple-webserver
curl localhost:8088
curl: (7) Failed to connect to localhost port 8088: Connection refused
```


In host machine open a browser and enter http://192.168.56.101:30338/
My hostname is simple-webserver



#### Deploy an application as replication controller (Deprecated), Access from outside and create replication

```
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



#### Set details of pod (Node, IP etc)

```
kubectl describe pod tmp-webserver-6rkgm
```



#### List all pods

```
kubectl get pods --all-namespaces
kubectl get pods -n kube-system
```



#### Ping between pods

```
kubectl get pods -o wide

NAME                  READY   STATUS    RESTARTS   AGE     IP            NODE               NOMINATED NODE   READINESS GATES
simple-webserver      1/1     Running   0          3h59m   10.233.69.5   kubernetes-node1   <none>           <none>
tmp-webserver-2f78c   1/1     Running   0          46m     10.233.69.7   kubernetes-node1   <none>           <none>
tmp-webserver-6rkgm   1/1     Running   0          46m     10.233.73.5   kubernetes-node2   <none>           <none>
tmp-webserver-v9lr6   1/1     Running   0          54m     10.233.69.6   kubernetes-node1   <none>           <none>
```
```
kubectl exec simple-webserver -- ifconfig #### shows ifconfig output
kubectl exec simple-webserver -- ping 10.233.69.7 #### ping to 10.233.69.7
kubectl exec simple-webserver -- ping tmp-webserver-2f78c #### FAILS. Doesn't ping to tmp-webserver-2f78c
```

