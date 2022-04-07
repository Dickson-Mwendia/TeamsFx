<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@microsoft/teamsfx](./teamsfx.md) &gt; [ConversationBot](./teamsfx.conversationbot.md)

## ConversationBot class

> This API is provided as a preview for developers and may change based on feedback that we receive. Do not use this API in a production environment.
> 

Provide utilities for bot conversation, including: - handle command and response. - send notification to varies targets (e.g., member, channel, incoming wehbook).

<b>Signature:</b>

```typescript
export declare class ConversationBot 
```

## Remarks

Set `adapter` in [ConversationOptions](./teamsfx.conversationoptions.md) to use your own bot adapter.

For command and response, ensure each command should ONLY be registered with the command once, otherwise it'll cause unexpected behavior if you register the same command more than once.

For notification, set `notification.options.storage` in [ConversationOptions](./teamsfx.conversationoptions.md) to use your own storage implementation.

## Example

For command and response, you can register your commands through the constructor, or use the `registerCommand` and `registerCommands` API to add commands later.

```typescript
// register through constructor
const conversationBot = new ConversationBot({
  command: {
    enabled: true,
    options: {
        commands: [ new HelloWorldCommandHandler() ],
    },
  },
});

// register through `register*` API
conversationBot.command.registerCommand(new HelpCommandHandler());
```
For notification, you can enable notification at initialization, then send notificaations at any time.

```typescript
// enable through constructor
const conversationBot = new ConversationBot({
  notification: {
    enabled: true,
  },
});

// get all bot installations and send message
for (const target of await conversationBot.notification.installations()) {
  await target.sendMessage("Hello Notification");
}

// alternative - send message to all members
for (const target of await conversationBot.notification.installations()) {
  for (const member of await target.members()) {
    await member.sendMessage("Hello Notification");
  }
}
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(options)](./teamsfx.conversationbot._constructor_.md) |  | <b><i>(BETA)</i></b> Creates new instance of the <code>ConversationBot</code>. |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [adapter](./teamsfx.conversationbot.adapter.md) |  | BotFrameworkAdapter | <b><i>(BETA)</i></b> The bot adapter. |
|  [command?](./teamsfx.conversationbot.command.md) |  | [CommandBot](./teamsfx.commandbot.md) | <b><i>(BETA)</i></b> <i>(Optional)</i> The entrypoint of command and response. |
|  [notification?](./teamsfx.conversationbot.notification.md) |  | [NotificationBot](./teamsfx.notificationbot.md) | <b><i>(BETA)</i></b> <i>(Optional)</i> The entrypoint of notification. |
