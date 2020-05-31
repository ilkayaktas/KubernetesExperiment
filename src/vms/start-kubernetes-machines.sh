#!/bin/bash

VBoxManage startvm kubernetes-master  --type headless
VBoxManage startvm kubernetes-node1  --type headless
VBoxManage startvm kubernetes-node2  --type headless
VBoxManage startvm kubernetes-master-replica  --type headless