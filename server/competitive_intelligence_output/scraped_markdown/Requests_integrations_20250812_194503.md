# Requests — integrations Technical Content Summary

- URL: https://requests.readthedocs.io/en/latest/user/advanced/
- Scraped At: 20250812_194503
- Quality Score: 7.5/10
- Technical Relevance: 0.17

## Code Blocks (196)
### Block 1 — unknown
```
urllib3
```

### Block 2 — unknown
```
s=requests.Session()s.get('https://httpbin.org/cookies/set/sessioncookie/123456789')r=s.get('https://httpbin.org/cookies')print(r.text)# '{"cookies": {"sessioncookie": "123456789"}}'
```

### Block 3 — unknown
```
s=requests.Session()s.auth=('user','pass')s.headers.update({'x-test':'true'})# both 'x-test' and 'x-test2' are sents.get('https://httpbin.org/headers',headers={'x-test2':'true'})
```

### Block 4 — unknown
```
s=requests.Session()r=s.get('https://httpbin.org/cookies',cookies={'from-my':'browser'})print(r.text)# '{"cookies": {"from-my": "browser"}}'r=s.get('https://httpbin.org/cookies')print(r.text)# '{"cookies": {}}'
```

### Block 5 — unknown
```
Session.cookies
```

## Links (132)
- [¶](#advanced-usage)
- [¶](#session-objects)
- [connection pooling](https://urllib3.readthedocs.io/en/latest/reference/urllib3.connectionpool.html)
- [HTTP persistent connection](https://en.wikipedia.org/wiki/HTTP_persistent_connection)
- [Cookie utility functions](../../api/#api-cookies)
- [Session.cookies](../../api/#requests.Session.cookies)
- [Session API Docs](../../api/#sessionapi)
- [¶](#request-and-response-objects)
- [¶](#prepared-requests)
- [Response](../../api/#requests.Response)

## Text Content Preview

Advanced Usage — Requests 2.32.4 documentationAdvanced Usage¶This document covers some of Requests more advanced features.Session Objects¶The Session object allows you to persist certain parameters across
requests. It also persists cookies across all requests made from the
Session instance, and will useurllib3’sconnection pooling. So if
you’re making several requests to the same host, the underlying TCP
connection will be reused, which can result in a significant performance
increase (seeHTTP persistent connection).A Session object has all the methods of the main Requests API.Let’s persist some cookies across requests:s=requests.Session()s.get('https://httpbin.org/cookies/set/sessioncookie/123456789')r=s.get('https://httpbin.org/cookies')print(r.text)# '{"cookies": {"sessioncookie": "123456789"}}'Sessions can also be used to provide default data to the request methods. This
is done by providing data to the properties on a Session object:s=requests.Session()s.auth=('user','pass')s.headers.update({'x-test':'true'})# both 'x-test' and 'x-test2' are sents.get('https://httpbin.org/headers',headers={'x-test2':'true'})Any dictionaries that you pass to a request method will be merged with 

…