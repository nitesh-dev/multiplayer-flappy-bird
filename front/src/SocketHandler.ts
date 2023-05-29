import { Player } from "./Utils";

type MessageType = "create/room" | "join/room" | "dis-join/room" | "room/closed" | "get/rooms" |
    "remove-player" | "add-player" |
    "before/game/start" | "game/start" | "game/end" |
    "go/add" | "go/update" | "go/remove" |
    "game/action"
export type ActionType = "set_pos" | "set_color"
type Fun = () => void
type Fun1 = (data: any) => void
export interface EventCallback {
    onConnected?: Fun
    onDisConnected?: Fun
    onJoinedRoom?: Fun1
    onDisJoinedRoom?: Fun
    onRoomCreated?: Fun
    onRoomClosed?: Fun
    onAddPlayer?: Fun1
    onRemovePlayer?: Fun1

    onBeforeGameStart?: Fun1
    onGameStart?: Fun1 //all gameObject
    onGameEnd?: Fun
    onAddGameObject?: Fun1
    onRemoveGameObject?: Fun1
    onUpdateGameObject?: Fun1
    onGameAction?: Fun1

}
export default class SocketHandler {
    private wSocket: WebSocket
    private _onConnectedFun: (() => void)[] = []
    private _eventCallbacks: EventCallback[] = []
    private addObserver() {
        this.wSocket.addEventListener('open', () => {
            console.log('Socket connected');
            this._eventCallbacks.forEach((e) => {
                e.onConnected?.()
            })
        });
        this.wSocket.addEventListener('message', (e) => {
            const { type, data } = JSON.parse(e.data);
            this.handleMessage(type, data)
        })
        this.wSocket.addEventListener('close', () => {
            console.log('Socket closed');
            this._eventCallbacks.forEach((e) => {
                e.onDisConnected?.()
            })
        });
    }
    private handleMessage(type: MessageType, data: any) {
        if (type == 'create/room') {
            this._eventCallbacks.forEach((e) => {
                e.onRoomCreated?.()
            })
        }
        else if (type == 'room/closed') {
            this._eventCallbacks.forEach((e) => {
                e.onRoomClosed?.()
            })
        }
        else if (type == 'join/room') {
            this._eventCallbacks.forEach((e) => {
                e.onJoinedRoom?.(data)
            })
        }
        else if (type == 'dis-join/room') {
            this._eventCallbacks.forEach((e) => {
                e.onDisJoinedRoom?.()
            })
        }
        else if (type == 'add-player') {
            this._eventCallbacks.forEach((e) => {
                e.onAddPlayer?.(data)
            })
        }
        else if (type == 'remove-player') {
            this._eventCallbacks.forEach((e) => {
                e.onRemovePlayer?.(data)
            })
        }
        else if (type == 'before/game/start') {
            this._eventCallbacks.forEach((e) => {
                e.onBeforeGameStart?.(data)
            })
        }
        else if (type == 'game/start') {
            this._eventCallbacks.forEach((e) => {
                e.onGameStart?.(data)
            })
        }
        else if (type == 'game/end') {
            this._eventCallbacks.forEach((e) => {
                e.onGameEnd?.()
            })
        }
        else if (type == 'game/action') {
            this._eventCallbacks.forEach((e) => {
                e.onGameAction?.(data)
            })
        }
        else if (type == 'go/update') {
            this._eventCallbacks.forEach((e) => {
                e.onUpdateGameObject?.(data)
            })
        }

    }
    constructor(url: string) {
        this.wSocket = new WebSocket(url)
        this.addObserver()
    }
    close() {
        if (this.wSocket.readyState == 1) {
            this.wSocket.close()
        }
    }

    setOnEventCallbackListener(call: EventCallback) {
        this._eventCallbacks.push(call)
        return call
    }
    removeOnEventCallbackListener(call: EventCallback) {
        this._eventCallbacks = this._eventCallbacks.filter((value) => value != call)
    }

    createRoom(player: Player) {
        this.sendMessage("create/room", player)
    }
    joinRoom(player: Player) {
        this.sendMessage("join/room", player)
    }
    sendMessage(type: MessageType, data: any) {
        this.wSocket.send(JSON.stringify({ type, data }))
    }
    sendAction(actionType: ActionType, data: any) {
        this.sendMessage("game/action", {
            type: actionType,
            data: data
        })
    }

}