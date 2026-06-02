import { API_CONFIG } from '../config/api.config';

type StompSubscription = {
    unsubscribe: () => void;
};

function toWebSocketUrl(path: string) {
    const baseUrl = API_CONFIG.BASE_URL.replace(/^http/, 'ws');
    return `${baseUrl}${path}`;
}

function createFrame(command: string, headers: Record<string, string> = {}, body = '') {
    const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
    return `${command}\n${headerLines.join('\n')}\n\n${body}\0`;
}

function parseFrames(rawData: string) {
    return rawData
        .split('\0')
        .map((frame) => frame.trim())
        .filter(Boolean)
        .map((frame) => {
            const [head, body = ''] = frame.split('\n\n');
            const [command, ...headerLines] = head.split('\n');
            const headers = Object.fromEntries(
                headerLines
                    .map((line) => {
                        const separatorIndex = line.indexOf(':');
                        return separatorIndex >= 0
                            ? [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)]
                            : [line, ''];
                    }),
            );
            return { command, headers, body };
        });
}

export function subscribeToStompTopic<T>(destination: string, onMessage: (message: T) => void): StompSubscription {
    const socket = new WebSocket(toWebSocketUrl('/ws'));
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    let isClosed = false;

    socket.onopen = () => {
        socket.send(createFrame('CONNECT', {
            'accept-version': '1.2',
            'heart-beat': '10000,10000',
        }));
    };

    socket.onmessage = (event) => {
        parseFrames(String(event.data)).forEach((frame) => {
            if (frame.command === 'CONNECTED') {
                socket.send(createFrame('SUBSCRIBE', {
                    id: subscriptionId,
                    destination,
                    ack: 'auto',
                }));
                return;
            }

            if (frame.command === 'MESSAGE') {
                onMessage(JSON.parse(frame.body) as T);
            }
        });
    };

    return {
        unsubscribe: () => {
            if (isClosed) {
                return;
            }
            isClosed = true;
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(createFrame('UNSUBSCRIBE', { id: subscriptionId }));
                socket.send(createFrame('DISCONNECT'));
            }
            socket.close();
        },
    };
}
