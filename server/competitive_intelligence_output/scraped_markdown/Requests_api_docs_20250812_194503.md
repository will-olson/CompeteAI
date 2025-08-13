# Requests — api_docs Technical Content Summary

- URL: https://requests.readthedocs.io/en/latest/
- Scraped At: 20250812_194503
- Quality Score: 5.5/10
- Technical Relevance: 0.9

## Code Blocks (2)
### Block 1 — unknown
```
>>>r=requests.get('https://api.github.com/user',auth=('user','pass'))>>>r.status_code200>>>r.headers['content-type']'application/json; charset=utf8'>>>r.encoding'utf-8'>>>r.text'{"type":"User"...'>>>r.json(){'private_gists': 419, 'total_private_repos': 77, ...}
```

### Block 2 — unknown
```
.netrc
```

## Links (130)
- [¶](#requests-http-for-humans)
- [Installation](user/install/#install)
- [https://pepy.tech/project/requests](https://pepy.tech/project/requests)
- [https://pypi.org/project/requests/](https://pypi.org/project/requests/)
- [https://pypi.org/project/requests/](https://pypi.org/project/requests/)
- [https://pypi.org/project/requests/](https://pypi.org/project/requests/)
- [similar code, sans Requests](https://gist.github.com/973705)
- [urllib3](https://github.com/urllib3/urllib3)
- [¶](#beloved-features)
- [¶](#the-user-guide)

## Text Content Preview

Requests: HTTP for Humans™ — Requests 2.32.4 documentationRequests: HTTP for Humans™¶Release v2.32.4. (Installation)Requestsis an elegant and simple HTTP library for Python, built for human beings.Behold, the power of Requests:>>>r=requests.get('https://api.github.com/user',auth=('user','pass'))>>>r.status_code200>>>r.headers['content-type']'application/json; charset=utf8'>>>r.encoding'utf-8'>>>r.text'{"type":"User"...'>>>r.json(){'private_gists': 419, 'total_private_repos': 77, ...}Seesimilar code, sans Requests.Requestsallows you to send HTTP/1.1 requests extremely easily.
There’s no need to manually add query strings to your
URLs, or to form-encode your POST data. Keep-alive and HTTP connection pooling
are 100% automatic, thanks tourllib3.Beloved Features¶Requests is ready for today’s web.Keep-Alive & Connection PoolingInternational Domains and URLsSessions with Cookie PersistenceBrowser-style SSL VerificationAutomatic Content DecodingBasic/Digest AuthenticationElegant Key/Value CookiesAutomatic DecompressionUnicode Response BodiesHTTP(S) Proxy SupportMultipart File UploadsStreaming DownloadsConnection TimeoutsChunked Requests.netrcSupportRequests officially supports Python 3.9+

…