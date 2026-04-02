# mcp-randomuser

MCP server for generating random user profiles via [randomuser.me](https://randomuser.me/). Free, no auth required.

## Tools

| Tool | Description |
|------|-------------|
| `generate_users` | Generate random user profiles with names, addresses, emails, photos |
| `generate_by_gender` | Generate random user profiles filtered by gender |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "randomuser_generate_users",
      "arguments": { "count": 3 }
    },
    "id": 1
  }'
```

## License

MIT
