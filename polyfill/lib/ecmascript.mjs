import GetIntrinsic from 'es-abstract/GetIntrinsic.js';
import ES2019 from 'es-abstract/es2019.js';
import { assign as ObjectAssign, unique } from './compat.mjs';

const IntlDateTimeFormat = Intl.DateTimeFormat;

const _TemporalDateTime = import('./datetime.mjs')
const _TemporalDate = import('./date.mjs')
const _TemporalYearMonth = import('./yearmonth.mjs')
const _TemporalMonthDay = import('./monthday.mjs')
const _TemporalTime = import('./time.mjs')
const _TemporalAbsolute = import('./absolute.mjs')
const _TemporalTimeZone = import('./timezone.mjs')
const _TemporalDuration = import('./duration.mjs')

let TemporalDateTime
let TemporalDate
let TemporalYearMonth
let TemporalMonthDay
let TemporalTime
let TemporalAbsolute
let TemporalTimeZone
let TemporalDuration

const INTRINSICS = {}

export const _temporalLoaded= Promise.all([
	_TemporalDateTime,
	_TemporalDate,
	_TemporalYearMonth,
	_TemporalMonthDay,
	_TemporalTime,
	_TemporalAbsolute,
	_TemporalTimeZone,
	_TemporalDuration
]).then( function( temps){
	TemporalDateTime= temps[ 0]
	TemporalDate= temps[ 1]
	TemporalYearMonth= temps[ 2]
	TemporalMonthDay= temps[ 3]
	TemporalTime= temps[ 4]
	TemporalAbsolute= temps[ 5]
	TemporalTimeZone= temps[ 6]
	TemporalDuration= temps[ 7]

	INTRINSICS['%Temporal.DateTime%']= TemporalDateTime
	INTRINSICS['%Temporal.Date%']= TemporalDate
	INTRINSICS['%Temporal.YearMonth%']= TemporalYearMonth
	INTRINSICS['%Temporal.MonthDay%']= TemporalMonthDay
	INTRINSICS['%Temporal.Time%']= TemporalTime
	INTRINSICS['%Temporal.TimeZone%']= TemporalTimeZone
	INTRINSICS['%Temporal.Absolute%']= TemporalAbsolute
	INTRINSICS['%Temporal.Duration%']= TemporalDuration
})

import bigInt from 'big-integer';

import {
  HasSlot,
  EPOCHNANOSECONDS,
  IDENTIFIER,
  YEAR,
  MONTH,
  DAY,
  HOUR,
  MINUTE,
  SECOND,
  MILLISECOND,
  MICROSECOND,
  NANOSECOND,
  YEARS,
  MONTHS,
  DAYS,
  HOURS,
  MINUTES,
  SECONDS,
  MILLISECONDS,
  MICROSECONDS,
  NANOSECONDS
} from './slots.mjs';

const DAYMILLIS = 86400000;


import * as PARSE from './regex.mjs';


export const ES = ObjectAssign(ObjectAssign({}, ES2019), {
  IsAbsolute: (item) => HasSlot(item, EPOCHNANOSECONDS),
  IsTimeZone: (item) => HasSlot(item, IDENTIFIER),
  IsDuration: (item) =>
    HasSlot(item, YEARS, MONTHS, DAYS, HOURS, MINUTES, SECONDS, MILLISECONDS, MICROSECONDS, NANOSECONDS),
  IsDate: (item) =>
    HasSlot(item, YEAR, MONTH, DAY) && !HasSlot(item, HOUR, MINUTE, SECOND, MILLISECOND, MICROSECOND, NANOSECOND),
  IsTime: (item) =>
    HasSlot(item, HOUR, MINUTE, SECOND, MILLISECOND, MICROSECOND, NANOSECOND) && !HasSlot(item, YEAR, MONTH, DAY),
  IsDateTime: (item) => HasSlot(item, YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, MILLISECOND, MICROSECOND, NANOSECOND),
  IsYearMonth: (item) => HasSlot(item, YEAR, MONTH) && !HasSlot(item, DAY),
  IsMonthDay: (item) => HasSlot(item, MONTH, DAY) && !HasSlot(item, YEAR),
  ToTimeZone: (item) => {
    if (ES.IsTimeZone(item)) return item;
    const isoString = ES.ToString(item);
    const match = PARSE.timezone.exec(isoString);
    if (!match) return new TemporalTimeZone(isoString);
    if (!match) throw new RangeError(`invalid absolute: ${isoString}`);
    const zone = match[1] ? 'UTC' : match[3] || match[2];
    return new TemporalTimeZone(zone);
  },
  ToAbsolute: (item) => {
    if (ES.IsAbsolute(item)) return item;
    if ('bigint' === typeof item || bigInt.isInstance(item)) return new TemporalAbsolute(item);
    const isoString = ES.ToString(item);
    const match = PARSE.absolute.exec(isoString);
    if (!match) throw new RangeError(`invalid absolute: ${isoString}`);
    const year = ES.ToInteger(match[1]);
    const month = ES.ToInteger(match[2]);
    const day = ES.ToInteger(match[3]);
    const hour = ES.ToInteger(match[4]);
    const minute = ES.ToInteger(match[5]);
    const second = ES.ToInteger(match[6]);
    const millisecond = ES.ToInteger(match[7]);
    const microsecond = ES.ToInteger(match[8]);
    const nanosecond = ES.ToInteger(match[9]);
    const zone = match[11] || match[10] || 'UTC';
    const datetime = ES.ToDateTime({
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond
    });
    return datetime.inTimeZone(zone, match[11] ? match[10] : 'earlier');
  },
  ToDateTime: (item) => {
    if (ES.IsDateTime(item)) return item;
    const props = ES.ValidPropertyBag(item, [
      'year',
      'month',
      'day',
      'hour',
      'minute',
      'second',
      'millisecond',
      'microsecond',
      'nanosecond'
    ]);
    if (props) {
      const {
        year = 0,
        month = 1,
        day = 1,
        hour = 0,
        minute = 0,
        second = 0,
        millisecond = 0,
        microsecond = 0,
        nanosecond = 0
      } = props;
      return new TemporalDateTime(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, 'reject');
    }
    const isoString = ES.ToString(item);
    const match = PARSE.datetime.exec(isoString);
    if (!match) throw new RangeError(`invalid datetime: ${isoString}`);
    const year = ES.ToInteger(match[1]);
    const month = ES.ToInteger(match[2]);
    const day = ES.ToInteger(match[3]);
    const hour = ES.ToInteger(match[4]);
    const minute = ES.ToInteger(match[5]);
    const second = ES.ToInteger(match[6]);
    const millisecond = ES.ToInteger(match[7]);
    const microsecond = ES.ToInteger(match[8]);
    const nanosecond = ES.ToInteger(match[9]);
    return new TemporalDateTime(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond, 'reject');
  },
  ToDate: (item) => {
    if (ES.IsDate(item)) return item;
    const props = ES.ValidPropertyBag(item, [
      'year',
      'month',
      'day'
    ]);
    if (props) {
      const {
        year = 0,
        month = 1,
        day = 1
      } = props;
      return new TemporalDate(year, month, day, 'reject');
    }
    const isoString = ES.ToString(item);
    const match = PARSE.date.exec(isoString);
    if (!match) throw new RangeError(`invalid date: ${isoString}`);
    const year = ES.ToInteger(match[1]);
    const month = ES.ToInteger(match[2]);
    const day = ES.ToInteger(match[3]);
    return new TemporalDate(year, month, day, 'reject');
  },
  ToTime: (item) => {
    if (ES.IsTime(item)) return item;
    const props = ES.ValidPropertyBag(item, [
      'hour',
      'minute',
      'second',
      'millisecond',
      'microsecond',
      'nanosecond'
    ]);
    if (props) {
      const {
        hour = 0,
        minute = 0,
        second = 0,
        millisecond = 0,
        microsecond = 0,
        nanosecond = 0
      } = props;
      return new TemporalTime(hour, minute, second, millisecond, microsecond, nanosecond, 'reject');
    }
    const isoString = ES.ToString(item);
    const match = PARSE.time.exec(isoString);
    if (!match) throw new RangeError(`invalid date: ${isoString}`);
    const hour = ES.ToInteger(match[1]);
    const minute = ES.ToInteger(match[2]);
    const second = ES.ToInteger(match[3]);
    const millisecond = ES.ToInteger(match[4]);
    const microsecond = ES.ToInteger(match[5]);
    const nanosecond = ES.ToInteger(match[6]);
    return new TemporalTime(hour, minute, second, millisecond, microsecond, nanosecond, 'reject');
  },
  ToYearMonth: (item) => {
    if (ES.IsYearMonth(item)) return item;
    const props = ES.ValidPropertyBag(item, [
      'year',
      'month'
    ]);
    if (props) {
      const {
        year = 0,
        month = 1
      } = props;
      return new TemporalYearMonth(year, month, 'reject');
    }
    const isoString = ES.ToString(item);
    const match = PARSE.yearmonth.exec(isoString);
    if (!match) throw new RangeError(`invalid yearmonth: ${isoString}`);
    const year = ES.ToInteger(match[1]);
    const month = ES.ToInteger(match[2]);
    return new TemporalYearMonth(year, month, 'reject');
  },
  ToMonthDay: (item) => {
    if (ES.IsMonthDay(item)) return item;
    const props = ES.ValidPropertyBag(item, [
      'month',
      'day'
    ]);
    if (props) {
      const {
        month = 1,
        day = 1
      } = props;
      return new TemporalMonthDay(month, day, 'reject');
    }
    const isoString = ES.ToString(item);
    const match = PARSE.monthday.exec(isoString);
    if (!match) throw new RangeError(`invalid yearmonth: ${isoString}`);
    const month = ES.ToInteger(match[1] || match[3]);
    const day = ES.ToInteger(match[2] || match[4]);
    return new TemporalMonthDay(month, day, 'reject');
  },
  ToDuration: (item) => {
    if (ES.IsDuration(item)) return item;
    const props = ES.ValidPropertyBag(item, [
      'years',
      'months',
      'days',
      'hours',
      'minutes',
      'seconds',
      'milliseconds',
      'microseconds',
      'nanoseconds'
    ]);
    if (props) {
      const {
        years = 0,
        months = 0,
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
        milliseconds = 0,
        microseconds = 0,
        nanoseconds = 0
      } = props;
      return new TemporalDuration(years, months, days, hours, minutes, seconds, milliseconds, microseconds, nanoseconds, 'reject');
    }
    const isoString = ES.ToString(item);
    const match = PARSE.duration.exec(isoString);
    if (!match) throw new RangeError(`invalid duration: ${isoString}`);
    const years = ES.ToInteger(match[1]);
    const months = ES.ToInteger(match[2]);
    const days = ES.ToInteger(match[3]);
    const hours = ES.ToInteger(match[4]);
    const minutes = ES.ToInteger(match[5]);
    const seconds = ES.ToInteger(match[6]);
    const milliseconds = ES.ToInteger(match[7]);
    const microseconds = ES.ToInteger(match[8]);
    const nanoseconds = ES.ToInteger(match[9]);
    return new TemporalDuration(
      years,
      months,
      days,
      hours,
      minutes,
      seconds,
      milliseconds,
      microseconds,
      nanoseconds,
      'reject'
    );
  },
  GetIntrinsic: (intrinsic) => {
    return intrinsic in INTRINSICS ? INTRINSICS[intrinsic] : GetIntrinsic(intrinsic);
  },
  ValidPropertyBag: (bag, anyof = []) => {
    if (!bag || 'object' !== typeof bag) return false;
    let any;
    for (let prop of anyof) {
      if (prop in bag) {
        const value = ES.ToNumber(bag[prop]);
        if (Number.isFinite(value)) {
          any = any || {};
          any[prop] = value;
        }
      }
    }
    return any ? any : false;
  },
  ValidDuration: (durationbag, invalid = []) => {
    for (let prop of invalid) {
      if (prop in durationbag) {
        const value = ES.ToNumber(durationbag[prop]);
        if (Number.isFinite(value) && !!value) {
          return false;
        }
      }
    }
    return true;
  },
  ToTimeZone: (tz) => {
    const TimeZone = ES.GetIntrinsic('%Temporal.TimeZone%');
    return tz instanceof TimeZone ? tz : new TimeZone(`${tz}`);
  },
  ISOTimeZoneString: (timeZone, absolute) => {
    let offset = timeZone.getOffsetFor(absolute);
    let timeZoneString;
    switch (true) {
      case 'UTC' === timeZone.name:
        timeZoneString = 'Z';
        break;
      case timeZone.name === offset:
        timeZoneString = offset;
        break;
      default:
        timeZoneString = `${offset}[${timeZone.name}]`;
        break;
    }
    return timeZoneString;
  },
  ISOYearString: (year) => {
    let yearString;
    if (year < 1000 || year > 9999) {
      let sign = year < 0 ? '-' : '+';
      let yearNumber = Math.abs(year);
      yearString = sign + `000000${yearNumber}`.slice(-6);
    } else {
      yearString = `${year}`;
    }
    return yearString;
  },
  ISODateTimePartString: (part) => `00${part}`.slice(-2),
  ISOSecondsString: (seconds, millis, micros, nanos) => {
    if (!seconds && !millis && !micros && !nanos) return '';

    let parts = [];
    if (nanos) parts.unshift(`000${nanos || 0}`.slice(-3));
    if (micros || parts.length) parts.unshift(`000${micros || 0}`.slice(-3));
    if (millis || parts.length) parts.unshift(`000${millis || 0}`.slice(-3));
    let secs = `00${seconds}`.slice(-2);
    let post = parts.length ? `.${parts.join('')}` : '';
    return `${secs}${post}`;
  },
  GetCanonicalTimeZoneIdentifier: (timeZoneIdentifier) => {
    const offset = parseOffsetString(timeZoneIdentifier);
    if (offset !== null) return makeOffsetString(offset);
    const formatter = new IntlDateTimeFormat('en-us', {
      timeZone: String(timeZoneIdentifier),
      hour12: false,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    });
    formatter.toString = tzIdent;
    return formatter;
  },
  GetTimeZoneOffsetNanoseconds: (epochNanoseconds, timeZone) => {
    const offset = parseOffsetString(`${timeZone}`);
    if (offset !== null) return bigInt(offset).multiply(1e6);
    const { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond } = ES.GetTimeZoneDateTimeParts(
      epochNanoseconds,
      timeZone
    );
    const utc = ES.GetEpochFromParts(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);
    return utc.minus(epochNanoseconds);
  },
  GetTimeZoneOffsetString: (epochNanoseconds, timeZone) => {
    const offsetNanos = bigInt(ES.GetTimeZoneOffsetNanoseconds(epochNanoseconds, timeZone));
    const offsetString = makeOffsetString(offsetNanos.divide(1e6));
    return offsetString;
  },
  GetEpochFromParts: (year, month, day, hour, minute, second, millisecond, microsecond, nanosecond) => {
    const ms = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    let ns = bigInt(ms).multiply(1e6);
    ns = ns.plus(bigInt(microsecond).multiply(1e3));
    ns = ns.plus(bigInt(nanosecond));
    return ns;
  },
  GetTimeZoneDateTimeParts: (epochNanoseconds, timeZone) => {
    const offset = parseOffsetString(timeZone);
    let nanos = bigInt(epochNanoseconds).mod(1e9);
    let epochMilliseconds = bigInt(epochNanoseconds).divide(1e9).multiply(1e3).plus(Math.floor(nanos / 1e6));
    nanos = +((epochNanoseconds < 0 ? 1e9 : 0) + nanos);
    let millisecond = Math.floor(nanos / 1e6) % 1e3;
    let microsecond = Math.floor(nanos / 1e3) % 1e3;
    let nanosecond = Math.floor(nanos / 1e0) % 1e3;

    if (offset !== null) {
      let zonedEpochMilliseconds = epochMilliseconds + offset;
      let item = new Date(zonedEpochMilliseconds);
      let year = item.getUTCFullYear();
      let month = item.getUTCMonth();
      let day = item.getUTCDate();
      let hour = item.getUTCHours();
      let minute = item.getUTCMinutes();
      let second = item.getUTCSeconds();

      let days = 0;
      ({ days, hour, minute, second, millisecond, microsecond, nanosecond } = ES.BalanceTime(
        hour,
        minute,
        second,
        millisecond,
        microsecond,
        nanosecond
      ));
      day += days;
      ({ year, month, day } = ES.BalanceDate(year, month, day));
      return {
        year,
        month,
        day,
        hour,
        minute,
        second,
        millisecond,
        microsecond,
        nanosecond
      };
    }
    let year, month, day, hour, minute, second;
    ({ year, month, day, hour, minute, second } = ES.GetFormatterParts(timeZone, epochMilliseconds).reduce(
      reduceParts,
      {}
    ));
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.BalanceTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond
    ));
    day += deltaDays;
    ({ year, month, day } = ES.BalanceDate(year, month, day));
    return { year, month, day, hour, minute, second, millisecond, microsecond, nanosecond };
  },
  GetTimeZoneNextTransition: (epochNanoseconds, timeZone) => {
    const offset = parseOffsetString(timeZone);
    if (offset !== null) {
      return null;
    }

    let leftNanos = epochNanoseconds;
    let leftOffset = ES.GetTimeZoneOffsetString(leftNanos, timeZone);
    let rightNanos = leftNanos;
    let rightOffset = leftOffset;
    let weeks = 0;
    while ((leftOffset === rightOffset) && (weeks < 104)) {
      rightNanos = bigInt(leftNanos).plus(7 * 24 * DAYMILLIS * 1e6);
      rightOffset = ES.GetTimeZoneOffsetString(rightNanos, timeZone);
      if (leftOffset === rightOffset) {
        leftNanos = rightNanos;
      }
      weeks++;
    }
    if (leftOffset === rightOffset) return null;
    const result = bisect(
      (epochNS) => ES.GetTimeZoneOffsetString(epochNS, timeZone),
      leftNanos,
      rightNanos,
      leftOffset,
      rightOffset
    );
    return result;
  },
  GetFormatterParts: (fmt, v) => {
    const datetime = fmt.format(v);
    const [date, time] = datetime.split(/,\s+/);
    const [month, day, year] = date.split('/');
    const [hour, minute, second] = time.split(':');
    return [
      { type: 'year', value: +year },
      { type: 'month', value: +month },
      { type: 'day', value: +day },
      { type: 'hour', value: +hour },
      { type: 'minute', value: +minute },
      { type: 'second', value: +second }
    ];
  },
  GetTimeZoneEpochValue: (timeZone, year, month, day, hour, minute, second, millisecond, microsecond, nanosecond) => {
    const offset = parseOffsetString(timeZone);
    let ns = ES.GetEpochFromParts(year, month, day, hour, minute, second, millisecond, microsecond, nanosecond);

    if (offset !== null) {
      ns = ns.plus(bigInt(offset).multiply(1e6));
      return [ns];
    }

    const earliest = ES.GetTimeZoneOffsetNanoseconds(bigInt(ns).minus(bigInt(DAYMILLIS).multiply(1e6)), timeZone);
    const latest = ES.GetTimeZoneOffsetNanoseconds(bigInt(ns).plus(bigInt(DAYMILLIS).multiply(1e6)), timeZone);
    const found = unique([earliest, latest])
      .map((offsetNanoseconds) => {
        const epochNanoseconds = bigInt(ns).minus(offsetNanoseconds);
        const parts = ES.GetTimeZoneDateTimeParts(epochNanoseconds, timeZone);
        if (
          year !== parts.year ||
          month !== parts.month ||
          day !== parts.day ||
          hour !== parts.hour ||
          minute !== parts.minute ||
          second !== parts.second ||
          millisecond !== parts.millisecond ||
          microsecond !== parts.microsecond ||
          nanosecond !== parts.nanosecond
        ) {
          return undefined;
        }
        return epochNanoseconds;
      })
      .filter((x) => x !== undefined);
    return found;
  },
  LeapYear: (year) => {
    if (undefined === year) return false;
    const isDiv4 = year % 4 === 0;
    const isDiv100 = year % 100 === 0;
    const isDiv400 = year % 400 === 0;
    return isDiv4 && (!isDiv100 || isDiv400);
  },
  DaysInMonth: (year, month) => {
    const DoM = {
      standard: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
      leapyear: [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    };
    return DoM[ES.LeapYear(year) ? 'leapyear' : 'standard'][month - 1];
  },
  DayOfWeek: (year, month, day) => {
    const m = month + (month < 3 ? 10 : -2);
    const Y = year - (month < 3 ? 1 : 0);

    const c = Math.floor(Y / 100);
    const y = Y - c * 100;
    const d = day;

    const pD = d;
    const pM = Math.floor(2.6 * m - 0.2);
    const pY = y + Math.floor(y / 4);
    const pC = Math.floor(c / 4) - 2 * c;

    const dow = (pD + pM + pY + pC) % 7;

    return dow + (dow <= 0 ? 7 : 0);
  },
  DayOfYear: (year, month, day) => {
    let days = day;
    for (let m = month - 1; m > 0; m--) {
      days += ES.DaysInMonth(year, m);
    }
    return days;
  },
  WeekOfYear: (year, month, day) => {
    let doy = ES.DayOfYear(year, month, day);
    let dow = ES.DayOfWeek(year, month, day) || 7;
    let doj = ES.DayOfWeek(year, 1, 1);

    const week = Math.floor((doy - dow + 10) / 7);

    if (week < 1) {
      if (doj === (ES.LeapYear(year) ? 5 : 6)) {
        return 53;
      } else {
        return 52;
      }
    }
    if (week === 53) {
      if ((ES.LeapYear(year) ? 366 : 365) - doy < 4 - dow) {
        return 1;
      }
    }

    return week;
  },

  BalanceYearMonth: (year, month) => {
    month -= 1;
    year += Math.floor(month / 12);
    if (month < 0) {
      month = 12 + (month % 12);
    } else if (month > 11) {
      month = month % 12;
    }
    month += 1;
    return { year, month };
  },
  BalanceDate: (year, month, day) => {
    ({ year, month } = ES.BalanceYearMonth(year, month));
    let daysInYear = 0;
    while (((daysInYear = ES.LeapYear(month > 2 ? year : year - 1) ? -366 : -365), day < daysInYear)) {
      year -= 1;
      day -= daysInYear;
    }
    while (((daysInYear = ES.LeapYear(month > 2 ? year + 1 : year) ? 366 : 365), day > daysInYear)) {
      year += 1;
      day -= daysInYear;
    }

    while (day < 1) {
      month -= 1;
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      day = ES.DaysInMonth(year, month) + day;
    }
    while (day > ES.DaysInMonth(year, month)) {
      day = day - ES.DaysInMonth(year, month);
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }

    return { year, month, day };
  },
  BalanceTime: (hour, minute, second, millisecond, microsecond, nanosecond) => {
    microsecond += Math.floor(nanosecond / 1000);
    nanosecond = nanosecond % 1000;
    nanosecond = nanosecond < 0 ? 1000 + nanosecond : nanosecond;

    millisecond += Math.floor(microsecond / 1000);
    microsecond = microsecond % 1000;
    microsecond = microsecond < 0 ? 1000 + microsecond : microsecond;

    second += Math.floor(millisecond / 1000);
    millisecond = millisecond % 1000;
    millisecond = millisecond < 0 ? 1000 + millisecond : millisecond;

    minute += Math.floor(second / 60);
    second = second % 60;
    second = second < 0 ? 60 + second : second;

    hour += Math.floor(minute / 60);
    minute = minute % 60;
    minute = minute < 0 ? 60 + minute : minute;

    let deltaDays = Math.floor(hour / 24);
    hour = hour % 24;
    hour = hour < 0 ? 24 + hour : hour;

    return { deltaDays, hour, minute, second, millisecond, microsecond, nanosecond };
  },

  ConstrainToRange: (value, min, max) => Math.min(max, Math.max(min, value)),
  ConstrainDate: (year, month, day) => {
    year = ES.ConstrainToRange(year, -999999, 999999);
    month = ES.ConstrainToRange(month, 1, 12);
    day = ES.ConstrainToRange(day, 1, ES.DaysInMonth(year, month));
    return { year, month, day };
  },
  ConstrainTime: (hour, minute, second, millisecond, microsecond, nanosecond) => {
    hour = ES.ConstrainToRange(hour, 0, 23);
    minute = ES.ConstrainToRange(minute, 0, 59);
    second = ES.ConstrainToRange(second, 0, 59);
    millisecond = ES.ConstrainToRange(millisecond, 0, 999);
    microsecond = ES.ConstrainToRange(microsecond, 0, 999);
    nanosecond = ES.ConstrainToRange(nanosecond, 0, 999);
    return { hour, minute, second, millisecond, microsecond, nanosecond };
  },

  RejectToRange: (value, min, max) => {
    if (value < min || value > max) throw new RangeError(`value out of range: ${min} <= ${value} <= ${max}`);
    return value;
  },
  RejectDate: (year, month, day) => {
    year = ES.RejectToRange(year, -999999, 999999);
    month = ES.RejectToRange(month, 1, 12);
    day = ES.RejectToRange(day, 1, ES.DaysInMonth(year, month));
    return { year, month, day };
  },
  RejectTime: (hour, minute, second, millisecond, microsecond, nanosecond) => {
    hour = ES.RejectToRange(hour, 0, 23);
    minute = ES.RejectToRange(minute, 0, 59);
    second = ES.RejectToRange(second, 0, 60);
    millisecond = ES.RejectToRange(millisecond, 0, 999);
    microsecond = ES.RejectToRange(microsecond, 0, 999);
    nanosecond = ES.RejectToRange(nanosecond, 0, 999);
    return { hour, minute, second, millisecond, microsecond, nanosecond };
  },
  DifferenceDate: (smaller, larger) => {
    let years = larger.year - smaller.year;
    let months = larger.month - smaller.month;
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    let { year, month } = ES.BalanceYearMonth(smaller.year + years, smaller.month + months);
    while (smaller.day > ES.DaysInMonth(year, month)) {
      months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      ({ year, month } = ES.BalanceYearMonth(smaller.year + years, smaller.month + months));
    }
    let days = ES.DayOfYear(larger.year, larger.month, larger.day) - ES.DayOfYear(year, month, smaller.day);
    if (days < 0) {
      months -= 1;
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      ({ year, month } = ES.BalanceYearMonth(smaller.year + years, smaller.month + months));
      while (smaller.day > ES.DaysInMonth(year, month)) {
        months -= 1;
        if (months < 0) {
          years -= 1;
          months += 12;
        }
        ({ year, month } = ES.BalanceYearMonth(smaller.year + years, smaller.month + months));
      }
      if (larger.year > year) {
        const din = ES.LeapYear(year) ? 366 : 365;
        days = ES.DayOfYear(larger.year, larger.month, larger.day) + (din - ES.DayOfYear(year, month, smaller.day));
      } else {
        days = ES.DayOfYear(larger.year, larger.month, larger.day) - ES.DayOfYear(year, month, smaller.day);
      }
    }
    return { years, months, days };
  },
  DifferenceTime(earlier, later) {
    let hours = later.hour - earlier.hour;
    let minutes = later.minute - earlier.minute;
    let seconds = later.second - earlier.second;
    let milliseconds = later.millisecond - earlier.millisecond;
    let microseconds = later.microsecond - earlier.microsecond;
    let nanoseconds = later.nanosecond - earlier.nanosecond;
    let deltaDays = 0;
    ({
      deltaDays,
      hour: hours,
      minute: minutes,
      second: seconds,
      millisecond: milliseconds,
      microsecond: microseconds,
      nanosecond: nanoseconds
    } = ES.BalanceTime(hours, minutes, seconds, milliseconds, microseconds, nanoseconds));
    return { deltaDays, hours, minutes, seconds, milliseconds, microseconds, nanoseconds };
  },
  AddDate: (year, month, day, years, months, days, disambiguation = 'constrain') => {
    year += years;
    month += months;
    ({ year, month } = ES.BalanceYearMonth(year, month));

    switch (disambiguation) {
      case 'reject':
        ({ year, month, day } = ES.RejectDate(year, month, day));
        break;
      case 'constrain':
        ({ year, month, day } = ES.ConstrainDate(year, month, day));
        break;
      case 'balance':
        ({ year, month, day } = ES.BalanceDate(year, month, day));
        break;
      default:
        throw new TypeError('disambiguation should be either reject, constrain or balance');
    }

    day += days;
    ({ year, month, day } = ES.BalanceDate(year, month, day));
    return { year, month, day };
  },
  AddTime: (
    hour,
    minute,
    second,
    millisecond,
    microsecond,
    nanosecond,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  ) => {
    hour += hours;
    minute += minutes;
    second += seconds;
    millisecond += milliseconds;
    microsecond += microseconds;
    nanosecond += nanoseconds;
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.BalanceTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond
    ));
    return { deltaDays, hour, minute, second, millisecond, microsecond, nanosecond };
  },
  SubtractDate: (year, month, day, years, months, days, disambiguation = 'constrain') => {
    day -= days;
    ({ year, month, day } = ES.BalanceDate(year, month, day));
    month -= months;
    year -= years;
    ({ year, month } = ES.BalanceYearMonth(year, month));

    switch (disambiguation) {
      case 'reject':
        ({ year, month, day } = ES.RejectDate(year, month, day));
        break;
      case 'constrain':
        ({ year, month, day } = ES.ConstrainDate(year, month, day));
        break;
      case 'balance':
        ({ year, month, day } = ES.BalanceDate(year, month, day));
        break;
      default:
        throw new TypeError('disambiguation should be either reject, constrain or balance');
    }
    return { year, month, day };
  },
  SubtractTime: (
    hour,
    minute,
    second,
    millisecond,
    microsecond,
    nanosecond,
    hours,
    minutes,
    seconds,
    milliseconds,
    microseconds,
    nanoseconds
  ) => {
    hour -= hours;
    minute -= minutes;
    second -= seconds;
    millisecond -= milliseconds;
    microsecond -= microseconds;
    nanosecond -= nanoseconds;
    let deltaDays = 0;
    ({ deltaDays, hour, minute, second, millisecond, microsecond, nanosecond } = ES.BalanceTime(
      hour,
      minute,
      second,
      millisecond,
      microsecond,
      nanosecond
    ));
    return { deltaDays, hour, minute, second, millisecond, microsecond, nanosecond };
  },

  AssertPositiveInteger: (num) => {
    if (!Number.isFinite(num) || Math.abs(num) !== num) throw new RangeError(`invalid positive integer: ${num}`);
    return num;
  },
  SystemUTCEpochNanoSeconds: (() => {
    let ns = Date.now() % 1e6;
    return () => {
      const ms = Date.now();
      const result = bigInt(ms).multiply(1e6).plus(ns);
      ns = ms % 1e6;
      return result;
    };
  })(),
  SystemTimeZone: () => {
    const fmt = new IntlDateTimeFormat('en-us');
    return ES.ToTimeZone(fmt.resolvedOptions().timeZone);
  },
  ComparisonResult: (value) => (value < 0 ? -1 : value > 0 ? 1 : value)
});

import * as REGEX from './regex.mjs';
const OFFSET = new RegExp(`^${REGEX.offset.source}$`);

function parseOffsetString(string) {
  const match = OFFSET.exec(String(string));
  if (!match) return null;
  const sign = match[1] === '-' ? -1 : +1;
  const hours = +match[2];
  const minutes = +match[3];
  return sign * (hours * 60 + minutes) * 60 * 1000;
}
function makeOffsetString(offsetMilliSeconds) {
  let offsetSeconds = Math.round(offsetMilliSeconds / 1000);
  const sign = (offsetSeconds < 0) ? '-' : '+';
  offsetSeconds = Math.abs(offsetSeconds);
  const offsetMinutes = Math.floor(offsetSeconds / 60) % 60;
  const offsetHours = Math.floor(offsetSeconds / 3600);
  const offsetMinuteString = `00${offsetMinutes}`.slice(-2);
  const offsetHourString = `00${offsetHours}`.slice(-2);
  return `${sign}${offsetHourString}:${offsetMinuteString}`;
}
function reduceParts(res, item) {
  if (item.type === 'literal') return res;
  if (item.type === 'timeZoneName') return res;
  res[item.type] = parseInt(item.value, 10);
  return res;
}
function bisect(getState, left, right, lstate = getState(left), rstate = getState(right)) {
  left = bigInt(left);
  right = bigInt(right);
  while (right.minus(left).greater(1)) {
    let middle = left.plus(right).divide(2);
    const mstate = getState(middle);
    if (mstate === lstate) {
      left = middle;
      lstate = mstate;
    } else if(mstate === rstate) {
      right = middle;
      rstate = mstate;
    } else {
      throw new Error(`invalid state in bisection ${lstate} - ${mstate} - ${rstate}`);
    }
  }
  return right;
}

function tzIdent() {
  return this.resolvedOptions().timeZone;
}
