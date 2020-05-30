#!/bin/bash

VBoxManage controlvm kubernetes-master acpipowerbutton
VBoxManage controlvm kubernetes-node1 acpipowerbutton
VBoxManage controlvm kubernetes-node2 acpipowerbutton
VBoxManage controlvm kubernetes-master-replica acpipowerbutton