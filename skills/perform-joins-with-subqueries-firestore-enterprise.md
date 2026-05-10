## Overview

Firestore Enterprise edition supports relational-style joins through
**correlated subqueries**. Unlike many NoSQL databases that often require
denormalizing data or performing multiple client-side requests, subqueries allow
you to combine and aggregate data from related collections or subcollections
directly on the server.

Subqueries are expressions that execute a nested pipeline for every document
processed by the outer query. This enables complex data retrieval patterns,
such as fetching a document alongside its related subcollection items or
joining logically linked data across disparate root collections.

## Concepts

This section introduces the core concepts behind using subqueries for
performing joins in Pipeline operations.

### Subqueries as expressions

A subquery is not a top-level stage; instead, it is an **expression** that
can be used in any stage that accepts expressions, such as
[`select(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/select),
[`add_fields(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/add-fields),
[`where(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/where), or [`sort(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/sort).

Cloud Firestore supports three types of subqueries:

- **Array Subqueries:** Materialize the entire result set of the subquery as an array of documents.
- **Scalar Subqueries:** Evaluate to a single value, such as a count, an average, or a specific field from a related document.
- **`subcollection(...)` Subqueries:** simplified joins for a one-to-many parent-child relation.

### Scope and variables

When writing a join, the nested subquery often needs to reference fields
from the "outer" document (the parent). To bridge these scopes, you use the
[`let(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/let) stage (referred to as `define(...)` in some
SDKs) to define variables in the parent scope that can then be referenced in the
subquery using the `variable(...)` function.

## Syntax

The following sections give an overview of the syntax for performing joins.

### The `let(...)` stage

The [`let(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/let) stage (referred to as `define(...)` in some
SDKs) is a non-filtering stage that explicitly brings data from the parent scope
into a named variable for use in subsequent nested scopes.

### Array Subqueries

An Array subquery is a special case of expression subquery that materializes the
entire result set of the subquery into an array. If the subquery returns zero
rows, it evaluates to an empty array. It never returns a `null` array. Such
queries are useful when the full results are required in the final result, such
as when materializing a nested or correlated collection.

Queries can filter, sort, \& aggregate in the subquery to also reduce the amount
of data that needs to be fetched and returned to help reduce the cost of the
query. The order of the subquery is respected, meaning that a `sort(...)` stage
in the subquery controls the order of results in the final array.

Use the `toArrayExpression()` SDK wrapper to convert a query into an array.

### Scalar Subqueries

Scalar subqueries are often used in a [`select(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/select) or
[`where(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/where) stage as allow filtering or resulting the
result of a subquery without materializing the full query directly.

A scalar subquery which produce zero results will evaluate to `null` itself,
while a subquery which evaluates to multiple elements will result in a runtime
error.

When a scalar subquery produces only a single field per-result, the field is
_elevated_ to be the top-level result for the subquery. This is most commonly
seen when the subquery ends with a `select(field("user_name"))` or
`aggregate(countAll().as("total"))` where the schema of the subquery is just a
single field. Otherwise when a subquery can produce multiple fields they are
wrapped in a map.

Use the `toScalarExpression()` SDK wrapper to convert a query into a scalar
expression.

### `subcollection(...)` Subqueries

While offered as a stage, the
[`subcollection(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/input/subcollection) input stage allows
performing joins over Cloud Firestore's hierarchical data model. In a
hierarchical model, queries often need to retrieve a document alongside data
from its own subcollections. While you can achieve this using a
[`collection_group(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/input/collection-group) input stage followed
by a filter on the parent reference, `subcollection(...)` provides a much more
concise syntax.

Other than the implicit join condition, this acts similarly to an array
subquery, returning an empty result if no documents are matched, even if the
nested collection does not exist.

It is fundamentally **syntactic sugar** : it automatically uses the `__name__` of
the document in the outer scope as the join key to resolve the hierarchical
relationship. This makes it the preferred way to perform lookups across
collections linked in a parent-child relationship.

## Examples

### Example data

The following loads a set of test data to use in all following examples.

### Node.js

    // Load set of cities.
    const cities = collection(db, "cities");

    await setDoc(doc(cities, "SF"), {
      name: "San Francisco",
      state: "CA",
      country: "USA",
    });
    await setDoc(doc(cities, "LA"), {
      name: "Los Angeles",
      state: "CA",
      country: "USA"
    });
    await setDoc(doc(cities, "DC"), {
      name: "Washington, D.C.",
      state: null,
      country: "USA"
    });
    await setDoc(doc(cities, "TOK"), {
      name: "Tokyo",
      state: null,
      country: "Japan"
    });

    // Load restaurants in various cities.
    const sfRestaurants = collection(db, "cities", "SF", "restaurants");
    const laRestaurants = collection(db, "cities", "LA", "restaurants");
    const dcRestaurants = collection(db, "cities", "DC", "restaurants");

    const rest1 = await addDoc(sfRestaurants, {
      name: "Golden Gate Pizza",
      type: "pizza",
      owner_id: "Mario Rossi"
    });
    const rest2 = await addDoc(sfRestaurants, {
      name: "Bay Area Burger",
      type: "burger",
      owner_id: "Sarah Jenkins"
    });
    const rest3 = await addDoc(sfRestaurants, {
      name: "Sunset Taco",
      type: "mexican",
      owner_id: "Edward"
    });

    const rest4 = await addDoc(laRestaurants, {
      name: "Hollywood Sushi",
      type: "sushi",
      owner_id: "Ken Kenji"
    });
    const rest5 = await addDoc(laRestaurants, {
      name: "Venice Pizza",
      type: "pizza",
      owner_id: "Luigi Romano"
    });

    const rest6 = await addDoc(dcRestaurants, {
      name: "Capitol Tacos",
      type: "mexican",
      owner_id: "Maria Garcia"
    });
    const rest7 = await addDoc(dcRestaurants, {
      name: "Georgetown Coffee",
      type: "cafe",
      owner_id: "David Kim"
    });

    // Load collection of reviews.
    const reviews = collection(db, "reviews");

    await addDoc(reviews, { restaurant: rest1, rating: 5, reviewer_id "Alice" });
    await addDoc(reviews, { restaurant: rest1, rating: 4, reviewer_id "Bob" });
    await addDoc(reviews, { restaurant: rest2, rating: 4, reviewer_id "Charlie" });
    await addDoc(reviews, { restaurant: rest3, rating: 5, reviewer_id "Diana" });
    await addDoc(reviews, { restaurant: rest3, rating: 4, reviewer_id "Edward" });
    await addDoc(reviews, { restaurant: rest3, rating: 4, reviewer_id "Fiona" });
    // rest4 has 0 reviews
    await addDoc(reviews, { restaurant: rest5, rating: 3, reviewer_id "George" });
    await addDoc(reviews, { restaurant: rest6, rating: 5, reviewer_id "Hannah" });
    await addDoc(reviews, { restaurant: rest6, rating: 4, reviewer_id "Ian" });
    await addDoc(reviews, { restaurant: rest7, rating: 5, reviewer_id "Julia" });

### Lookup a Document in Another Collection

The following query on the `reviews` collection group performs a lookup into
the `restaurant` collection group using a primary key reference.

### Node.js

    let results = await execute(db.pipeline()
      .collectionGroup("reviews")
      .define(field("restaurant").as("restaurant_name"))
      .addFields(db.pipeline()
        .collectionGroup("restaurant")
        .where(field("__name__").equal(variable("restaurant_name")))
        .select("name", "type")
        .toScalarExpression()
        .as("restaurant")));

**Response**

    {
      rating: 5,
      reviewer_id "Alice",
      restaurant: { name: "Golden Gate Pizza", type: "pizza" }
    },
    {
      rating: 4,
      reviewer_id "Bob",
      restaurant: { name: "Golden Gate Pizza", type: "pizza" }
    },
    {
      rating: 4,
      reviewer_id "Charlie",
      restaurant: { name: "Bay Area Burger", type: "burger" }
    },
    {
      rating: 5,
      reviewer_id "Diana",
      restaurant: { name: "Sunset Taco", type: "mexican" }
    },
    {
      rating: 4,
      reviewer_id "Edward",
      restaurant: { name: "Sunset Taco", type: "mexican" }
    },
    {
      rating: 4,
      reviewer_id "Fiona",
      restaurant: { name: "Sunset Taco", type: "mexican" }
    },
    {
      rating: 3,
      reviewer_id "George",
      restaurant: { name: "Venice Pizza", type: "pizza" }
    },
    {
      rating: 5,
      reviewer_id "Hannah",
      restaurant: { name: "Capitol Tacos", type: "mexican" }
    },
    {
      rating: 4,
      reviewer_id "Ian",
      restaurant: { name: "Capitol Tacos", type: "mexican" }
    },
    {
      rating: 5,
      reviewer_id "Julia",
      restaurant: { name: "Georgetown Coffee", type: "cafe" }
    }

### Combine Multiple Collections

The following query fetches all pizza places from the `restaurants` collection
group, and uses an array subquery to fetch and embed their associated reviews
directly into the response.

### Node.js

    let results = await execute(db.pipeline()
      .collectionGroup("restaurants")
      .where(field("type").equal("pizza"))
      .define(field("__name__").as("restaurant_name"))
      .select(
        field("name"),
        db.pipeline()
          .collectionGroup("reviews")
          .where(field("restaurant").equal(variable("restaurant_name")))
          .select("rating", "reviewer_id")
          .toArrayExpression()
          .as("reviews")));

**Response**

    {
      name: "Golden Gate Pizza",
      reviews: [
        { rating: 5, reviewer_id "Alice" },
        { rating: 4, reviewer_id "Bob" }
      ]
    },
    {
      name: "Venice Pizza",
      type: "pizza",
      owner_id: "Luigi Romano",
      reviews: [
        { rating: 3, reviewer_id "George" }
      ]
    }

### Aggregate Across Multiple Collections

The following query on the `restaurants` collection group uses a correlated
subquery to get the average rating for each restaurant from the `reviews`
collection group.

### Node.js

    let results = await execute(db.pipeline()
      .collectionGroup("restaurants")
      .where(field("type").equal("pizza"))
      .define(field("__name__").as("restaurant_name"))
      .select(
        field("name"),
        db.pipeline()
          .collectionGroup("reviews")
          .where(field("restaurant").equal(variable("restaurant_name")))
          .aggregate(average("rating").as("avg_rating"))
          .toScalarExpression()
          .as("avg_rating")));

**Response**

    {
      name: "Golden Gate Pizza",
      avg_rating: 4.5
    },
    {
      name: "Venice Pizza",
      avg_rating: 3.0
    }

### Top-N Per Group (Subquery with Limit)

The following query fetches all documents from the `restaurants` collection
group, and uses a correlated subquery to fetch the top 2 highest-rated reviews
for each restaurant.

This ensures that the array of reviews does not grow too large and hits the
query's memory limit.

### Node.js

    let results = await execute(db.pipeline()
      .collectionGroup("restaurants")
      .define(field("__name__").as("restaurant_name"))
      .select(
        field("name"),
        db.pipeline()
          .collectionGroup("reviews")
          .where(field("restaurant").equal(variable("restaurant_name")))
          .sort(field("rating").descending())
          .limit(2)
          .select("rating", "reviewer_id")
          .toArrayExpression()
          .as("top_reviews")));

**Response**

    {
      name: "Golden Gate Pizza",
      top_reviews: [
        { rating: 5, reviewer_id "Alice" },
        { rating: 4, reviewer_id "Bob" }
      ]
    },
    {
      name: "Bay Area Burger",
      top_reviews: [
        { rating: 4, reviewer_id "Charlie" }
      ]
    },
    {
      name: "Sunset Taco",
      top_reviews: [
        { rating: 5, reviewer_id "Diana" },
        { rating: 4, reviewer_id "Edward" }
      ]
    },
    {
      name: "Hollywood Sushi",
      top_reviews: []
    },
    {
      name: "Venice Pizza",
      top_reviews: [
        { rating: 3, reviewer_id "George" }
      ]
    },
    {
      name: "Capitol Tacos",
      top_reviews: [
        { rating: 5, reviewer_id "Hannah" },
        { rating: 4, reviewer_id "Ian" }
      ]
    },
    {
      name: "Georgetown Coffee",
      top_reviews: [
        { rating: 5, reviewer_id "Julia" }
      ]
    }

### Join Subcollections

The following query scans the `cities` collection and uses the
[`subcollection(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/input/subcollection) stage to implicitly join
over documents from a nested collection to find the number of restaurants per
city.

### Node.js

    let results = await execute(db.pipeline()
      .collection("cities")
      .addFields(subcollection("restaurants")
        .toArrayExpression()
        .length()
        .as("restaurant_count")));

**Response**

    {
      __name__: cities/SF,
      name: "San Francisco",
      state: "CA",
      country: "USA",
      restaurant_count: 3
    },
    {
      __name__: cities/LA,
      name: "Los Angeles",
      state: "CA",
      country: "USA",
      restaurant_count: 2
    },
    {
      __name__: cities/DC,
      name: "Washington, D.C.",
      state: null,
      country: "USA",
      restaurant_count: 2
    },
    {
      __name__: cities/TOK,
      name: "Tokyo",
      state: null,
      country: "Japan",
      restaurant_count: 0
    }

### Express Multiple Join Conditions

The following query scans the `restaurants` collection group and performs a
multi-field join with the `reviews` collection group to find owners reviewing
their own restaurants.

### Node.js

    let results = await execute(db.pipeline()
      .collectionGroup("restaurants")
      .define(field("owner_id"), field("__name__"))
      .where(db.pipeline()
        .collectionGroup("reviews")
        .where(field("restaurant").equal(variable("__name__")))
        .where(field("author").equal(variable("owner_id")))
        .aggregate(count().as("c"))
        .toScalarExpression()
        .greaterThan(0)));

**Response**

    {
      __name__: cities/SF/restaurants/X9An0HIlx29A9GPuRthS,
      name: "Sunset Taco",
      type: "mexican",
      owner_id: "Edward"
    }

### Anti-Join (`NOT EXISTS`)

The following query scans the `restaurants` collection group and finds all
restaurants that have no reviews yet.

### Node.js

    let results = await execute(db.pipeline()
      .collectionGroup("restaurants")
      .define(field("__name__").as("restaurant_name"))
      .where(db.pipeline()
        .collectionGroup("reviews")
        .where(field("restaurant").equal(variable("restaurant_name")))
        .aggregate(count().as("review_count"))
        .toScalarExpression()
        .equal(0)));

**Response**

    {
      __name__: "cities/LA/restaurants/X9An0HIlx29A9GPuRthS",
      name: "Hollywood Sushi",
      type: "sushi",
      owner_id: "Ken Kenji"
    }

### Subquery as Join

The following query flattens the relationship between each pizza place and its
reviews. By placing the subquery inside an
[`unnest(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/unnest) stage, the server duplicates the outer
restaurant document for each matching review, producing flat, joined documents
(similar to a SQL `INNER JOIN`).

### Node.js

    let results = await execute(db.pipeline()
      .collectionGroup("restaurants")
      .where(field("type").equal("pizza"))
      .define(field("__name__").as("restaurant_name"))
      .unnest(
        db.pipeline()
          .collectionGroup("reviews")
          .where(field("restaurant").equal(variable("restaurant_name")))
          .select("rating", "reviewer_id")
          .toArrayExpression()
          .as("review")));

**Response**

    {
      __name__: "cities/SF/restaurants/xU4pu8nFpnJDPZOwcSPP",
      name: "Golden Gate Pizza",
      type: "pizza",
      owner_id: "Mario Rossi"
      review: { rating: 5, reviewer_id "Alice" }
    },
    {
      __name__: "cities/SF/restaurants/xU4pu8nFpnJDPZOwcSPP",
      name: "Golden Gate Pizza",
      type: "pizza",
      owner_id: "Mario Rossi",
      review: { rating: 4, reviewer_id "Bob" }
    },
    {
      __name__: "cities/LA/restaurants/6CYntvNgbYzgaW652Gq1",
      name: "Venice Pizza",
      type: "pizza",
      owner_id: "Luigi Romano",
      review: { rating: 3, reviewer_id "George" }
    }

### Uncorrelated Subquery as Filter

The following query on the `reviews` collection performs filters using a
uncorrelated subquery on itself to find reviews greater than the average rating.

### Node.js

    let results = await execute(db.pipeline()
      .collection("reviews")
      // Average review rating is 4.3
      .where(field("rating").greaterThan(db.pipeline()
        .collection("reviews")
        .aggregate(average("rating").as("avg"))
        .toScalarExpression())))
      .select("rating", "reviewer_id");

**Response**

    {
      rating: 5,
      reviewer_id "Alice"
    },
    {
      rating: 5,
      reviewer_id "Diana"
    },
    {
      rating: 5,
      reviewer_id "Hannah"
    },
    {
      rating: 5,
      reviewer_id "Julia"
    }

## Best practices

- **Manage memory with `toArrayExpression()`:** Be cautious with `toArrayExpression()` subqueries, since materializing a large number of documents can exhaust the query memory limit (128 MiB). To mitigate this, use [`select(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/select) within the subquery to return only the necessary fields and apply [`where(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/where) filters to limit the number of documents returned. Consider using [`limit(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/limit) if appropriate to cap the number of documents returned by the subquery.
- **Indexing:** Ensure that fields used in the [`where(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/transformation/where) clause of a subquery are indexed. Performant joins rely on the ability to perform index seeks rather than full table scans.

For more query best practices, refer to our
[guide covering query optimization](https://firebase.google.com/docs/firestore/enterprise/optimize-query-performance).

## Limitations

- **[`subcollection(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/input/subcollection) scope:** The [`subcollection(...)`](https://firebase.google.com/docs/firestore/pipelines/stages/input/subcollection) input stage is only supported within subqueries, as it requires the context of a parent document to resolve the hierarchical relationship and perform the join.
- **Nesting Depth:** Subqueries can be nested up to 20 layers deep.
- **Memory Usage:** The 128 MiB limit on materialized data applies across the entire query, including all joined documents.
