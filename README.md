# remove-comments

Remove line comments from languages that have single and double quote strings

# Usage

---

note that this library is not bundled, since most web-based projects today do their own bundling (react, vue ETC).

---

```javascript
import { removeComments } from 'remove-comments';

const withoutComments = removeComments('// this is a comment\npublic static void main() {}');
```
