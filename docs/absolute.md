# `Temporal.Absolute`

A `Temporal.Absolute` is an absolute point in time, with a precision in nanoseconds.
No time zone or calendar information is present.
As such `Temporal.Absolute` has no concept of days, months or even hours.

For convenience of interoperability, it internally uses nanoseconds since the [Unix epoch](https://en.wikipedia.org/wiki/Unix_time) (midnight UTC on January 1, 1970).
However, a `Temporal.Absolute` can be created from any of several expressions that refer to a single point in time, including an ISO 8601 string with a time zone such as `'2020-01-23T17:04:36.491865121-08:00'`.

Since `Temporal.Absolute` doesn't contain any information about time zones, a `Temporal.TimeZone` is needed in order to convert it into a `Temporal.DateTime` (and from there into any of the other `Temporal` objects.)

Like Unix time, `Temporal.Absolute` ignores leap seconds.

## new Temporal.Absolute(epochNanoseconds : bigint) : Temporal.Absolute

**Parameters:**
- `epochNanoSeconds` (bigint): A number of nanoseconds.

**Returns:** a new `Temporal.Absolute` object.

Creates a new `Temporal.Absolute` object that represents a single point in time.

`epochNanoseconds` is the number of nanoseconds (10<sup>&minus;9</sup> seconds) between the Unix epoch (midnight UTC on January 1, 1970) and the desired point in time.

Use this constructor directly if you know the precise number of nanoseconds already and have it in bigint form, for example from a database.
Otherwise, `Temporal.Absolute.from()`, which accepts more kinds of input, is probably more convenient.

Example usage:
```js
abs = new Temporal.Absolute(1553906700000000000n);
// When was the Unix epoch?
epoch = new Temporal.Absolute(0n);  // => 1970-01-01T00:00Z
// Dates before the Unix epoch are negative
turnOfTheCentury = new Temporal.Absolute(-2208988800000000000n);  // => 1900-01-01T00:00Z
```

## Temporal.Absolute.from(thing: string | Temporal.Absolute) : Temporal.Absolute

**Parameters:**
- `thing` (string or `Temporal.Absolute`): The value representing the desired point in time.

**Returns:** a new `Temporal.Absolute` object (or the same object if `thing` was a `Temporal.Absolute` object.)

This static method creates a new `Temporal.Absolute` object from another value.
If the value is a string, it must be in ISO 8601 format, including a date, a time, and a time zone.
If the value is an object, it must be another `Temporal.Absolute` object, in which case the same object is returned.

If `thing` is a string, and the point in time cannot be uniquely determined from the string, then this function throws an exception.
This includes the case when `thing` is a validly-formatted ISO 8601 string denoting a time that doesn't exist, for example because it was skipped in a daylight saving time transition.

Example usage:
```js
abs = Temporal.Absolute.from('2019-03-30T01:45:00+01:00[Europe/Berlin]');
abs = Temporal.Absolute.from('2019-03-30T01:45+01:00');
abs = Temporal.Absolute.from('2019-03-30T00:45Z');
abs === Temporal.Absolute.from(abs);  // => true

// Not enough information to denote a single point in time:
/* WRONG */ abs = Temporal.Absolute.from('2019-03-30');  // no time; throws
/* WRONG */ abs = Temporal.Absolute.from('2019-03-30T01:45');  // no time zone; throws
/* WRONG */ abs = Temporal.Absolute.from('2019-03031T02:45+01:00[Europe/Berlin]');  // time skipped in DST transition; throws
```

## Temporal.Absolute.fromEpochSeconds(epochSeconds: number) : Temporal.Absolute

**Parameters:**
- `epochSeconds` (number): A number of seconds.

**Returns:** a new `Temporal.Absolute` object.

This static method creates a new `Temporal.Absolute` object with seconds precision.
`epochSeconds` is the number of seconds between the Unix epoch (midnight UTC on January 1, 1970) and the desired point in time.

The number of seconds since the Unix epoch is a common measure of time in many computer systems.
Use this method if you need to interface with such a system.

Usage example:
```js
// Same examples as in new Temporal.Absolute(), but with seconds precision
abs = Temporal.Absolute.fromEpochSeconds(1553906700);
epoch = Temporal.Absolute.fromEpochSeconds(0);  // => 1970-01-01T00:00Z
turnOfTheCentury = Temporal.Absolute.fromEpochSeconds(-2208988800);  // => 1900-01-01T00:00Z
```

## Temporal.Absolute.fromEpochMilliseconds(epochMilliseconds: number) : Temporal.Absolute

**Parameters:**
- `epochMilliseconds` (number): A number of milliseconds.

**Returns:** a new `Temporal.Absolute` object.

Same as `Temporal.Absolute.fromEpochSeconds()`, but with millisecond (10<sup>&minus;3</sup> second) precision.

The number of milliseconds since the Unix epoch is also returned from the `getTime()` and `valueOf()` methods of old-style JavaScript `Date` objects, as well as `Date.now()`.
Use this method to create a `Temporal.Absolute` object from a `Date` object, for example:
```js
jsdate = new Date('December 17, 1995 03:24:00 GMT')
abs = Temporal.Absolute.fromEpochMilliseconds(jsdate.getTime());  // => 1995-12-17T03:24Z
abs = Temporal.Absolute.fromEpochMilliseconds(+jsdate);  // valueOf() called implicitly

// This is a way to get the current time, but Temporal.now.absolute() would give the same with higher accuracy
todayMs = Temporal.Absolute.fromEpochMilliseconds(Date.now());
todayNs = Temporal.now.absolute();
```

## Temporal.Absolute.fromEpochMicroseconds(epochMilliseconds : bigint) : Temporal.Absolute

**Parameters:**
- `epochMicroseconds` (bigint): A number of microseconds.

**Returns:** a new `Temporal.Absolute` object.

Same as `Temporal.Absolute.fromEpochSeconds()`, but with microsecond (10<sup>&minus;6</sup> second) precision.

## Temporal.Absolute.fromEpochNanoseconds(epochNanoseconds : bigint) : Temporal.Absolute

**Parameters:**
- `epochNanoseconds` (bigint): A number of nanoseconds.

**Returns:** a new `Temporal.Absolute` object.

Same as `Temporal.Absolute.fromEpochSeconds()`, but with nanosecond (10<sup>&minus;9</sup> second) precision.
Also the same as `new Temporal.Absolute(epochNanoseconds)`.

## absolute.getEpochSeconds() : number

**Returns:** an integer number of seconds.

Returns the number of seconds between the Unix epoch (midnight UTC on January 1, 1970) and `absolute`.
This number will be negative if `absolute` is before 1970.
The number of seconds is rounded towards zero.

Use this method if you need to interface with some other system that reckons time in seconds since the Unix epoch.

Example usage:
```js
abs = Temporal.Absolute.from('2019-03-30T01:45+01:00');
abs.getEpochSeconds();  // => 1554000300
```

## absolute.getEpochMilliseconds() : number

**Returns:** an integer number of milliseconds.

Same as `getEpochSeconds()`, but with millisecond (10<sup>&minus;3</sup> second) precision.

This method can be useful in particular to create an old-style JavaScript `Date` object, if one is needed.
An example:
```js
abs = Temporal.Absolute.from('2019-03-30T00:45Z');
new Date(abs.getEpochMilliseconds());  // => 2019-03-30T00:45:00.000Z
```

## absolute.getEpochMicroseconds() : bigint

**Returns:** a number of microseconds, as a bigint.

Same as `getEpochSeconds()`, but with microsecond (10<sup>&minus;6</sup> second) precision.

## absolute.getEpochNanoseconds() : bigint

**Returns:** a number of nanoseconds, as a bigint.

Same as `getEpochSeconds()`, but with nanosecond (10<sup>&minus;9</sup> second) precision.

The value returned from this method is suitable to be passed to `new Temporal.Absolute()`.

## absolute.inTimeZone(timeZone: Temporal.TimeZone | string) : Temporal.DateTime

**Parameters:**
- `timeZone` (object or string): A `Temporal.TimeZone` object, or a string description of the time zone; either its IANA name or UTC offset.

**Returns:** a `Temporal.DateTime` object indicating the calendar date and wall-clock time in `timeZone` at the absolute time indicated by `absolute`.

For a list of IANA time zone names, see the current version of the [IANA time zone database](https://www.iana.org/time-zones).
A convenient list is also available [on Wikipedia](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), although it might not reflect the latest official status.

This method is one way to convert a `Temporal.Absolute` to a `Temporal.DateTime`.

Example usage:

```js
// Converting a specific absolute time to a calendar date / wall-clock time
timestamp = new Temporal.Absolute(1553993100000000000n);
timestamp.inTimeZone('Europe/Berlin');  // => 2019-03-31T01:45
timestamp.inTimeZone('UTC');  // => 2019-03-31T00:45
timestamp.inTimeZone('-08:00');  // => 2019-02-01T16:45

// What time was the Unix epoch (timestamp 0) in Bell Labs (Murray Hill, New Jersey, USA)?
epoch = new Temporal.Absolute(0n);
tz = new Temporal.TimeZone('America/New_York');
epoch.inTimeZone(tz);  // => 1969-12-31T19:00
```

## absolute.plus(duration: string | object) : Temporal.Absolute

**Parameters:**
- `duration` (string or object): A `Temporal.Duration` object, a duration-like object, or a string from which to create a `Temporal.Duration`.

**Returns:** a new `Temporal.Absolute` object which is the time indicated by `absolute` plus `duration`.

This method adds `duration` to `absolute`, returning a point in time that is in the future relative to `absolute`.

The `duration` argument can be any value that could be passed to `Temporal.Duration.from()`:
- a `Temporal.Duration` object;
- any object with properties denoting a duration, such as `{ hours: 5, minutes: 30 }`;
- a string in ISO 8601 duration format, such as `PT5H30M`.

Example usage:
```js
// Temporal.Absolute representing five hours from now
Temporal.now.absolute().plus({ hours: 5 });
Temporal.now.absolute().plus('PT5H');
fiveHours = new Temporal.Duration(0, 0, 0, 5);
Temporal.now.absolute().plus(fiveHours);
```

## absolute.minus(duration: string | object) : Temporal.Absolute

**Parameters:**
- `duration` (string or object): A `Temporal.Duration` object, a duration-like object, or a string from which to create a `Temporal.Duration`.

**Returns:** a new `Temporal.Absolute` object which is the time indicated by `absolute` minus `duration`.

This method subtracts `duration` from `absolute`, returning a point in time that is in the past relative to `absolute`.

The `duration` argument can be any value that could be passed to `Temporal.Duration.from()`:
- a `Temporal.Duration` object;
- any object with properties denoting a duration, such as `{ hours: 5, minutes: 30 }`;
- a string in ISO 8601 duration format, such as `PT5H30M`.

Example usage:
```js
// Temporal.Absolute representing this time yesterday
Temporal.now.absolute().minus({ days: 1 });
Temporal.now.absolute().minus('P1D');
oneDay = new Temporal.Duration(0, 0, 1);
Temporal.now.absolute().minus(oneDay);
```

## absolute.difference(other: Temporal.Absolute) : Temporal.Duration

**Parameters:**
- `other` (`Temporal.Absolute`): Another time with which to compute the difference.

**Returns:** a `Temporal.Duration` representing the difference between `absolute` and `other`.

This method computes the difference between the two times represented by `absolute` and `other`, and returns it as a `Temporal.Duration` object.
The difference is always positive, no matter the order of `absolute` and `other`, because `Temporal.Duration` objects cannot represent negative durations.

Example usage:
```js
startOfMoonMission = Temporal.Absolute.from('1969-07-16T13:32:00Z');
endOfMoonMission = Temporal.Absolute.from('1969-07-24T16:50:35Z');
missionLength = startOfMoonMission.difference(endOfMoonMission);  // => P8DT3H18M35S
endOfMoonMission.difference(startOfMoonMission);  // => P8DT3H18M35S
missionLength.toLocaleString();  // example output: '8 days 3 hours 18 minutes 35 seconds'
```

## absolute.toString(timeZone?: Temporal.TimeZone | string) : string

**Parameters:**
- `timeZone` (optional string or `Temporal.TimeZone`): the time zone to express `absolute` in.
  The default is to use UTC.

**Returns:** a string in the ISO 8601 date format representing `absolute`.

This method overrides the `Object.prototype.toString()` method and provides a convenient, unambiguous string representation of `absolute`.
The string can be passed to `Temporal.Absolute.from()` to create a new `Temporal.Absolute` object.

Example usage:
```js
abs = new Temporal.Absolute(1574074321816000000n);
abs.toString();  // => 2019-11-18T10:52:01.816Z
abs.toString(Temporal.TimeZone.from('UTC'));  // => 2019-11-18T10:52:01.816Z
abs.toString('Asia/Seoul');  // => 2019-11-18T19:52:01.816+09:00[Asia/Seoul]
```

## absolute.toLocaleString(locales?: string | array&lt;string&gt;, options?: object) : string

**Parameters:**
- `locales` (optional string or array of strings): A string with a BCP 47 language tag with an optional Unicode extension key, or an array of such strings.
- `options` (optional object): An object with properties influencing the formatting.

**Returns:** a language-sensitive representation of `absolute`.

This method overrides `Object.prototype.toLocaleString()` to provide a human-readable, language-sensitive representation of `absolute`.

The `locales` and `options` arguments are the same as in the constructor to [`Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat).

Example usage:
```js
abs = Temporal.Absolute.from("2019-11-18T11:00:00.000Z");
abs.toLocaleString();  // => example output: 2019-11-18, 3:00:00 a.m.
abs.toLocaleString('de-DE');  // => example output: 18.11.2019, 03:00:00
abs.toLocaleString('de-DE', { timeZone: 'Europe/Berlin', weekday: 'long' });  // => Montag, 18.11.2019, 12:00:00
abs.toLocaleString('en-US-u-nu-fullwide-hc-h12', { timeZone: 'Asia/Kolkata' });  // => １１/１８/２０１９, ４:３０:００ PM
```

## Temporal.Absolute.compare(one: Temporal.Absolute, two: Temporal.Absolute) : number

**Parameters:**
- `one` (`Temporal.Absolute`): First time to compare.
- `two` (`Temporal.Absolute`): Second time to compare.

**Returns:** &minus;1, 0, or 1.

Compares two `Temporal.Absolute` objects.
Returns an integer indicating whether `one` comes before or after or is equal to `two`.
- &minus;1 if `one` comes before `two`;
- 0 if `one` and `two` represent the same time;
- 1 if `one` comes after `two`.

This function can be used to sort arrays of `Temporal.Absolute` objects.
For example:
```javascript
one = Temporal.Absolute.fromEpochSeconds(1.0e9);
two = Temporal.Absolute.fromEpochSeconds(1.1e9);
three = Temporal.Absolute.fromEpochSeconds(1.2e9);
sorted = [three, one, two].sort(Temporal.Absolute.compare);
sorted.join(' ');
// => 2001-09-09T01:46:40Z 2004-11-09T11:33:20Z 2008-01-10T21:20Z
```

<script type="application/javascript" src="./prism.js"></script>
<link rel="stylesheet" type="text/css" href="./prism.css">
