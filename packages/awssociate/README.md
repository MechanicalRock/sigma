# `@mechanicalrock/awssociate`

A fluent factory system for instantiating AWS services using role-credential
pairs that require use of one or more STS hops.

Example Usage:

```
import { EnvironmentCredentials, S3, STS } from 'aws-sdk'

const base = new EnvironmentCredentials('AWS')

const myS3svc = new Awssociate({ credentials: base })
    .ForService<S3>()
    .WithOptions({
        Region: 'ap-southeast2'
    })
    .WithRoleChain({
        RoleArn: ''.
        RoleSessionName: '',
    }, {
        RoleArn: '',
        RoleSessionName: '',
    })
```