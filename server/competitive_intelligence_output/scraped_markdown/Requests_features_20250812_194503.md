# Requests — features Technical Content Summary

- URL: https://requests.readthedocs.io/en/latest/user/quickstart/
- Scraped At: 20250812_194503
- Quality Score: 7.5/10
- Technical Relevance: 0.0

## Code Blocks (117)
### Block 1 — python
```
>>>importrequests
```

### Block 2 — unknown
```
>>>r=requests.get('https://api.github.com/events')
```

### Block 3 — unknown
```
Response
```

### Block 4 — unknown
```
r
```

### Block 5 — unknown
```
>>>r=requests.post('https://httpbin.org/post',data={'key':'value'})
```

## Links (68)
- [¶](#quickstart)
- [installed](../install/#install)
- [up-to-date](../../community/updates/#updates)
- [¶](#make-a-request)
- [Response](../../api/#requests.Response)
- [¶](#passing-parameters-in-urls)
- [¶](#response-content)
- [¶](#binary-response-content)
- [brotli](https://pypi.org/project/brotli)
- [brotlicffi](https://pypi.org/project/brotlicffi)

## Text Content Preview

Quickstart — Requests 2.32.4 documentationQuickstart¶Eager to get started? This page gives a good introduction in how to get started
with Requests.First, make sure that:Requests isinstalledRequests isup-to-dateLet’s get started with some simple examples.Make a Request¶Making a request with Requests is very simple.Begin by importing the Requests module:>>>importrequestsNow, let’s try to get a webpage. For this example, let’s get GitHub’s public
timeline:>>>r=requests.get('https://api.github.com/events')Now, we have aResponseobject calledr. We can
get all the information we need from this object.Requests’ simple API means that all forms of HTTP request are as obvious. For
example, this is how you make an HTTP POST request:>>>r=requests.post('https://httpbin.org/post',data={'key':'value'})Nice, right? What about the other HTTP request types: PUT, DELETE, HEAD and
OPTIONS? These are all just as simple:>>>r=requests.put('https://httpbin.org/put',data={'key':'value'})>>>r=requests.delete('https://httpbin.org/delete')>>>r=requests.head('https://httpbin.org/get')>>>r=requests.options('https://httpbin.org/get')That’s all well and good, but it’s also only the start of what Requests can
do.Pa

…