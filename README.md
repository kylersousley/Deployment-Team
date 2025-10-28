# f25-resourceful-kylersousley

## Resource

**Rollercoaster**

Attributes:

* name (string)
* manufacturer (string)
* type (string)
* description (string)
* rating (string)

## Schema

``` sql
CREATE TABLE rollercoasters (
id INTEGER PRIMARY KEY,
name TEXT,
manufacturer TEXT,
type TEXT,
description TEXT,
rating TEXT);
```

## REST Endpoints

Name                                    | Method | Path
----------------------------------------|--------|------------------
Retrieve collection of rollercoasters   | GET    | /rollercoasters
Create a new rollercoaster member       | POST   | /rollercoasters
Update a rollercoaster member           | PUT    | /rollercoasters/*\<id\>*
Delete a rollercoaster member           | DELETE | /rollercoasters/*\<id\>*
