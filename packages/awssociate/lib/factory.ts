import { Credentials, STS, EnvironmentCredentials } from "aws-sdk";
import AWSXRay from 'aws-xray-sdk';

/*
Fluent factory system for instantiating AWS services using role-credential
pairs that require use of one or more STS hops.

Example Usage:
import { EnvironmentCredentials, S3, STS } from 'aws-sdk'

const base = new EnvironmentCredentials('AWS')

const myS3svc = new Factory({ credentials: base })
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
*/


export type Ctor<T, U> = new (options: U) => T;

export class Factory implements IForService {
    constructor(private options?: STS.ClientConfiguration) { }

    public ForService<T, U>(service: Ctor<T, U>) {
        return new ServiceFactory(service, this.options)
    }
}

interface IForService {
    ForService<T, U>(ctor: Ctor<T, U>): ServiceFactory<T,U>;
}

export class ServiceFactory<T, U> implements IWithOptions<T, U>, IWithRoleChain<T, U> {
    private options?: U = undefined;

    constructor(
        private service: Ctor<T, U>,
        private stsOptions?: STS.ClientConfiguration
        ) {}

    public WithOptions(options: U): OmitWithOptions<T, U> {
        if (this.options !== undefined) {
            throw new Error("WithOptions has already been called");
        }
        this.options = options;
        return this as OmitWithOptions<T, U>;
    }

    public async WithRoleChain(...roleRequests: STS.AssumeRoleRequest[]): Promise<T> {
        const stsOptions = this.stsOptions || {}
        // If no credentials have been supplied, then use the default AWS resolution mechanism
        const initialCredentials = Promise.resolve(stsOptions.credentials as Credentials )
        const credentials = await roleRequests.reduce((acc: Promise<Credentials>, r: STS.AssumeRoleRequest) => {
            return acc.then((cred) => {
                stsOptions.credentials = cred 
                return this.Assumer(stsOptions, r);
            });
        }, initialCredentials); 
        const serviceOptions = Object.assign({} as U, this.options || {}, { ...credentials });
        return AWSXRay.captureAWSClient(new this.service(serviceOptions));
    }

    private async Assumer(options: STS.ClientConfiguration, request: STS.AssumeRoleRequest)
    : Promise<Credentials> {
        const response = AWSXRay.captureAWSClient(new STS(options)).assumeRole(request);
        const token = (await response.promise()).Credentials;
        if (token === undefined) {
            throw new Error("Retrieved credentials were returned undefined");
        } else {
            return {
                accessKeyId: token.AccessKeyId,
                secretAccessKey: token.SecretAccessKey,
                sessionToken: token.SessionToken,
            } as Credentials;
        }
    }
}

interface IWithOptions<T, U> {
    WithOptions(options: U): OmitWithOptions<T, U>;
}

interface IWithRoleChain<T, U> {
    WithRoleChain(...roleRequests: STS.AssumeRoleRequest[]): Promise<T>;
}

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export type OmitWithOptions<T, U> = Omit<ServiceFactory<T, U>, "WithOptions">;
