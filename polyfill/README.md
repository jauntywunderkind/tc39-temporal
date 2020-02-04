# Temporal Polyfill

> Incomplete sad tragic attempt (for now) attempt at an ESM-ified rendition of the tc39-temporal polyfill

One lone hacktivists attempt to turn the #tc39 [Proposal: Temporal's](https://github.com/tc39/proposal-temporal) [polyfill](https://github.com/tc39/proposal-temporal/blob/main/polyfill/) into something usable in ESM.

# Usage

## caveats

Oh hello we have caveats. Issue 0, none of this works.

So, first, unlike the Temporal specification, this module is designed to look like an ESM module, as opposed to having it be built into the runtime (unlike the polyfill one would get from github.com/tc39-proposal/temporal).

Second, the hacktivist working to try to make something usable here has no idea how to deal with & has no idea what the `--icu-data-dir ./node_modules/full-icu/` node.js parameter the original polyfill instructions suggest does, & I am, for now, ignoring it. It is advised, if you are in a node.js env, to add this run-flag to your execution.

Third, there are super weird circular dependencies in the polyfill, that some how the official polyfill can handle because Rollup can deal with these circular dependencies, but Node.js can not deal with these circular dependencies. I have been trying, in vain, to hack around these circular dependencies, but they are deep, and tight, and my attempts to do the weird `export async function then(){/*...*/}` &c to hack the heck out of this hay have so far proven fruitless. Still trying.

So again, nothing works right now and the hacktivist redistributor working on the npm package you see here has had no success or wins using any of this code. The polyfill has proven very very hard for me to use. The hacking will continue. Please help us.

## plz try to use

```
import Temporal, { Temporal as orTemporal} from "@jauntywunderkind/tc39-temporal/lib/temporal.js"
import Duration, { Duration as orDuration} from "@jauntywunderkind/tc39-temporal/lib/duration.js"
```

This will currently get you Temporal and Duration, or their named alternatives. But they result in hella bad errors when you try to use them still, because the bad evil hacks I've tried to introduce to bypass the circular dependencies break things more, & at them moment yours truly is running out of hacks to throw at this.

# Please see

**Polyfill for [Proposal: Temporal](https://github.com/tc39/proposal-temporal)**
