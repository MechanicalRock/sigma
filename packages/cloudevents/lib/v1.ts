import { URL } from "url";
import { SNSEventRecord, SNSMessage } from "aws-lambda";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export module v1 {
    export module SNS {
        export type CloudEvent = {
            Records: CloudEventRecord[];
        }

        export type CloudEventRecord = Omit<SNSEventRecord, "Sns"> & {
            Sns: Omit<SNSMessage, "Message"> & {
                "Message": v1.CloudEvent
            }
        }

        export function Extract<T extends object>(
            fn: (e: v1.CloudEvent) => boolean,
            event: SNS.CloudEvent |  v1.CloudEvent
        ): v1.TypedCloudEvent<T>[] {
            if (IsSNSEvent(event)) {
                return event.Records.map(r => v1.Extract(fn, r.Sns.Message))
            }
            return [v1.Extract(fn, event)]
        }

        export function IsSNSEvent<T>(event: SNS.CloudEvent | T): event is SNS.CloudEvent {
            return (event as SNS.CloudEvent).Records !== undefined;
        }
    }

    export interface CloudEventMeta {
        eventTypeVersion: "1.0"
        eventType: string
        source: URL,
        eventID: string,
        extensions?: Map<string, string>
    }

    export interface CloudEvent extends CloudEventMeta {
        eventTime: Date,
        contentType: string,
        data: string | object
    }

    export interface TypedCloudEvent<T extends object> extends CloudEventMeta {
        eventTime: Date,
        contentType: string,
        data: T
    }

    export function CloudEvent<T extends object>(meta: CloudEventMeta,
        data: T,
        contentType: string = "application/json"): TypedCloudEvent<T> {
        return {
            eventTime: new Date(),
            contentType,
            ...meta,
            data
        }
    }

    export const IsEvent = <T extends object>(
        fn: (e: CloudEvent) => boolean, event: CloudEvent
    ): event is TypedCloudEvent<T> => {
        return fn(event)
    }

    export const Extract = <T extends object>(
        fn: (e: CloudEvent) => boolean, event: CloudEvent
    ): TypedCloudEvent<T> => {
        if (IsEvent<T>(fn, event)) {
            return event;
        }
        throw new Error("Event could not be coerced to type T");
    }
}
