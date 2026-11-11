## Description

Doctor Tracker gives hospital administrators one place to register doctors, assign and follow their
patients, and see how caseloads, admissions and patient conditions change over time. This repository is
the standalone Express API behind it: it authenticates admins with an httpOnly session cookie, validates
every request with Zod, serves searchable, filterable and paginated lists backed by purpose built MongoDB
indexes, and computes dashboard analytics with parallel aggregation pipelines.

