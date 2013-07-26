## Zerocomplete

---

### [DEMO](http://goo.gl/9Rs6VB)

---

#### Usage:
`$('input').zerocomplete(options)`

Here's a quick rundown of what options can contain:

Name          |   type           |     default       |   description
:---:         | ---              | :---:             | ---
`source`      | array, string    |   [ ]             | The data source to query against. If this is a string then it's assumed to be a url to send the query to in the `term` get param. If it's an array, it can be an array of strings or an array of objects.
`delay`       | number           | `300`             | The amount of time to wait after the keypress before the ajax call
`display`     | function, string | `label`           | When choosing from an array of objects, we need to know which property of the object to display in the dropdown (You don't want to display `[object Object]` for each item)
`select`      | function         | (nothing)         | The callback that gets called when the user selects an item from the dropdown or blurs the input when they don't choose an item from the list. You can also bind to the element's `zerocompleteselect` event
`getPath`     | function         | `return res.data` | When using ajax as the source, this is the callback that will take the response object and get the source data, defaults to: `function(res) { return res.data || res; }`
`get`         | function         | `jQuery.get`      | This is the function that does the ajax call, you can override it to send a xsrf token or to do some other logic, the term is the context and it passes the url and callback to run with the response passed in. eg <br> `function (url, cb) {`<br> `　$.post(url, {some: 'data'}, function(res) {`<br>  `　　cb(res);`<br>`　});` <br>  `}`
`response`    | function         | (nothing)         | This function is called after an ajax request completes but before the items are rendered, this gets passed the array and should return an array
`highlighter` | function         | typeahead func    | You can override the default behavior or way the the matched text is bolded. Useful for displaying complex views
`cache`       | object, false    | jQuery.cache.ajax | By default all ajax calls are cached to `jQuery.cache.ajax`, you can set this to another object, or turn it off by setting it to false| &nbsp;
`search`      | function         | (nothing)         | Callback that gets fired before a dropdown is displayed, return false to cancel| &nbsp;

Note that all standard typeahead options (except `source`) get passed in with the typeahead invocation so all typeahead options should also work

---

Released under the MIT license
