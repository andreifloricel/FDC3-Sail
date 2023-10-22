import { Context, IntentResult } from "fdc3-2.0";
import { MessagingSupport, SendMessage } from "../message";
import { FDC3_TOPICS } from "/@main/handlers/fdc3/topics";
import { createChannelObject } from "./channel";
import { IntentResultData } from "/@main/types/FDC3Message";
import { SailChannelData } from "/@main/types/FDC3Data";


const resultPromises: Map<string, (a : IntentResult) => void> = new Map();

export const connect = (ipc: MessagingSupport, sendMessage : SendMessage) => {
    /**
     * listen for incomming results
     */
    ipc.on(FDC3_TOPICS.RESULT_DELIVERY, async (event, a) => {
        console.log('ipc event', event.type, a);
        const ird = a as IntentResultData
        const id = ird.resultId;
        const ir = resultPromises.get(id);
        if (ir) {
            let data : IntentResult;
            if (a.type == 'channel') {
                // convert to channel
                const scd = ird.result as SailChannelData
                data = createChannelObject(sendMessage, scd.id, scd.type, undefined);
            } else {
                data = ird.result as Context;
            }

            ir(data);
        }
    });
};

export function createResultPromise(id: string) : Promise<IntentResult> {
    return new Promise<IntentResult>((resolve, reject) => {
        resultPromises.set(id, resolve);
    });
}


