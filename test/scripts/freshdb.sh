#!/bin/bash

mongoimport --drop --db $1 --collection accounts --file ../../db/accounts.json
mongoimport --drop --db $1 --collection transfers --file ../../db/tranfers.json
mongoimport --drop --db $1 --collection transactions --file ../../db/transactions.json
