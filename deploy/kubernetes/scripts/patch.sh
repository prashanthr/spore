#!/usr/bin/env bash
kubectl --namespace $KUBE_NAMESPACE patch cronjob $KUBE_JOB_NAME -p \
  "{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"date\":\"`date +'%s'`\"}}}}}"
