<p align=center>
<img src="https://raw.githubusercontent.com/xtao-org/fitzjson/master/logo2.png" alt="fitzJSON logo" width="160"/>
<h1 align=center>fitzjson-tests</h1>
</p>

Tests for [fitzJSON](https://github.com/xtao-org/fitzjson) parsers.

## ECMA-404 compliance

[`ecma404.test.js`](ecma404.test.js) verifies compliance with [JSON](http://www.json.org/) ([ECMA-404](http://www.ecma-international.org/publications/standards/Ecma-404.htm)/[RFC 8259](https://tools.ietf.org/html/rfc8259)). It uses tests from the [JSON Parsing Test Suite](https://github.com/nst/JSONTestSuite) by [Nicolas Seriot](https://github.com/nst), available under [JSONTestSuite](JSONTestSuite/README.md) (see also the excellent article [Parsing JSON is a Minefield 💣](https://seriot.ch/projects/parsing_json.html) by the same author, for which the test suite is an appendix).

Note: fitzJSON is a superset of JSON, thus is not aiming for strict compliance with ECMA-404, but superset-compliance. Meaning, some tests that were expected to fail for JSON may pass for fitzJSON (because the syntax is more permissive), but all tests that were expected to pass for JSON must also pass for fitzJSON. This is how success is measured here.