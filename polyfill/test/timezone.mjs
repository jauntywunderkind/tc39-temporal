#! /usr/bin/env -S node --experimental-modules

/*
 ** Copyright (C) 2018-2019 Bloomberg LP. All rights reserved.
 ** This code is governed by the license found in the LICENSE file.
 */

import Demitasse from '@pipobscure/demitasse';
const { describe, it, report } = Demitasse;

import Pretty from '@pipobscure/demitasse-pretty';
const { reporter } = Pretty;

import Assert from 'assert';
const { ok: assert, equal, throws } = Assert;

import * as Temporal from 'tc39-temporal';

describe('TimeZone', ()=>{
    describe('Structure', ()=>{
        it('Temporal.TimeZone is a function', ()=>equal(typeof Temporal.TimeZone, 'function'));
        it('Temporal.TimeZone has prototype', () => equal(typeof Temporal.TimeZone.prototype, 'object'));
        describe('Temporal.TimeZone.prototype', () => {
            it('Temporal.TimeZone.prototype has name', () => assert('name' in Temporal.TimeZone.prototype));
            it('Temporal.TimeZone.prototype has getOffsetFor', () => equal(typeof Temporal.TimeZone.prototype.getOffsetFor, 'function'));
            it('Temporal.TimeZone.prototype has getDateTimeFor', () => equal(typeof Temporal.TimeZone.prototype.getDateTimeFor, 'function'));
            it('Temporal.TimeZone.prototype has getAbsoluteFor', () => equal(typeof Temporal.TimeZone.prototype.getAbsoluteFor, 'function'));
            it('Temporal.TimeZone.prototype has getTransitions', () => equal(typeof Temporal.TimeZone.prototype.getTransitions, 'function'));
            it('Temporal.TimeZone.prototype has toString', () => equal(typeof Temporal.TimeZone.prototype.toString, 'function'));
        });
        it('Temporal.TimeZone has from', () => equal(typeof Temporal.TimeZone.from, 'function'));
    });
    describe('Construction', ()=>{
        test('+01:00');
        test('-01:00');
        test('+0330');
        test('-0650');
        test('Europe/Vienna');
        test('America/New_York');
        test('Africa/CAIRO');  // capitalization
        test('Asia/Ulan_Bator');  // IANA Link Name
        test('UTC');
        test('GMT');
        function test(zone) {
            it(`${zone} is a zone`, () => equal(typeof new Temporal.TimeZone(zone), 'object'));
        }
    });
    describe('.name property', () => {
        test('+01:00');
        test('-01:00');
        test('+0330', '+03:30');
        test('-0650', '-06:50');
        test('Europe/Vienna');
        test('America/New_York');
        test('Africa/CAIRO', 'Africa/Cairo');
        test('Asia/Ulan_Bator', 'Asia/Ulaanbaatar');
        test('UTC');
        test('GMT', 'UTC');
        function test(zone, name = zone) {
            it(`${zone} has name ${name}`, () => equal(new Temporal.TimeZone(zone).name, name));
        }
    });
    describe('+01:00', ()=>{
        const zone = new Temporal.TimeZone('+01:00');
        const abs = Temporal.Absolute.fromEpochSeconds(Math.floor(Math.random() * 1e9));
        const dtm = new Temporal.DateTime(1976, 11, 18, 15, 23, 30, 123,456,789);
        it(`${zone} has name ${zone}`, ()=>equal(zone.name, `${zone}`));
        it(`${zone} has offset +01:00`, ()=>equal(zone.getOffsetFor(abs), '+01:00'));
        it(`(${zone}).getDateTimeFor(${abs})`, () => assert(zone.getDateTimeFor(abs) instanceof Temporal.DateTime));
        it(`(${zone}).getAbsoluteFor(${dtm})`, () => assert(zone.getAbsoluteFor(dtm) instanceof Temporal.Absolute));
        it(`(${zone}).getTransitions() => []`, () => equal(ArrayFrom(zone.getTransitions(abs), 4).length, 0));
    });
    describe('UTC', () => {
        const zone = new Temporal.TimeZone('UTC');
        const abs = Temporal.Absolute.fromEpochSeconds(Math.floor(Math.random() * 1e9));
        const dtm = new Temporal.DateTime(1976, 11, 18, 15, 23, 30, 123, 456, 789);
        it(`${zone} has name ${zone}`, () => equal(zone.name, `${zone}`));
        it(`${zone} has offset +00:00`, () => equal(zone.getOffsetFor(abs), '+00:00'));
        it(`(${zone}).getDateTimeFor(${abs})`, () => assert(zone.getDateTimeFor(abs) instanceof Temporal.DateTime));
        it(`(${zone}).getAbsoluteFor(${dtm})`, () => assert(zone.getAbsoluteFor(dtm) instanceof Temporal.Absolute));
        it(`(${zone}).getTransitions() => []`, () => equal(ArrayFrom(zone.getTransitions(abs), 4).length, 0));
    });
    describe('America/Los_Angeles', () => {
        const zone = new Temporal.TimeZone('America/Los_Angeles');
        const abs = Temporal.Absolute.fromEpochSeconds();
        const dtm = new Temporal.DateTime(1976, 11, 18, 15, 23, 30, 123, 456, 789);
        it(`${zone} has name ${zone}`, () => equal(zone.name, `${zone}`));
        it(`${zone} has offset -08:00`, () => equal(zone.getOffsetFor(abs), '-08:00'));
        it(`(${zone}).getDateTimeFor(${abs})`, () => assert(zone.getDateTimeFor(abs) instanceof Temporal.DateTime));
        it(`(${zone}).getAbsoluteFor(${dtm})`, () => assert(zone.getAbsoluteFor(dtm) instanceof Temporal.Absolute));
        it(`(${zone}).getTransitions() => [4-transitions]`, () => equal(ArrayFrom(zone.getTransitions(abs), 4).length, 4));
    });
    describe('with DST change', () => {
        it('clock moving forward', () => {
            const zone = new Temporal.TimeZone('Europe/Berlin');
            const dtm = new Temporal.DateTime(2019, 3, 31, 2, 45);
            equal(`${zone.getAbsoluteFor(dtm, 'earlier')}`, '2019-03-31T00:45Z');
            equal(`${zone.getAbsoluteFor(dtm, 'later')}`, '2019-03-31T01:45Z');
            throws(() => zone.getAbsoluteFor(dtm, 'reject'), RangeError);
        });
        it('clock moving backward', () => {
            const zone = new Temporal.TimeZone('America/Sao_Paulo');
            const dtm = new Temporal.DateTime(2019, 2, 16, 23, 45);
            equal(`${zone.getAbsoluteFor(dtm, 'earlier')}`, '2019-02-17T01:45Z');
            equal(`${zone.getAbsoluteFor(dtm, 'later')}`, '2019-02-17T02:45Z');
            throws(() => zone.getAbsoluteFor(dtm, 'reject'), RangeError);
        });
    });
    describe('Casting', () => {
        const zone = Temporal.TimeZone.from('+03:30');
        it("getOffsetFor() doesn't cast its argument", () => {
            throws(() => zone.getOffsetFor(0n), TypeError);
            throws(() => zone.getOffsetFor('2019-02-17T01:45Z'), TypeError);
            throws(() => zone.getOffsetFor({}), TypeError);
        });
        it("getDateTimeFor() doesn't cast its argument", () => {
            throws(() => zone.getDateTimeFor(0n), TypeError);
            throws(() => zone.getDateTimeFor('2019-02-17T01:45Z'), TypeError);
            throws(() => zone.getDateTimeFor({}), TypeError);
        });
    });
});

function ArrayFrom(iter, limit = Number.POSITIVE_INFINITY) {
    const result = [];
    for (let item of iter) {
        if (result.length >= limit) return result;
        result.push(item);
    }
    return result;
}
import { normalize } from 'path';
if (normalize(import.meta.url.slice(8)) === normalize(process.argv[1]))
    report(reporter).then((failed) => process.exit(failed ? 1 : 0));
