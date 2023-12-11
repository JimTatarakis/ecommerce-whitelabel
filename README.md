
### Controller/Routing Paradigm

| Verb      | URI                             | Action  | Route Name             |
|-----------|---------------------------------|---------|------------------------|
| GET       | /photos/{photo}/comments        | index   | photos.comments.index  |
| GET       | /photos/{photo}/comments/create | create  | photos.comments.create |
| POST      | /photos/{photo}/comments        | store   | photos.comments.store  |
| GET       | /comments/{comment}             | show    | comments.show          |
| GET       | /comments/{comment}/edit        | edit    | comments.edit          |
| PUT/PATCH | /comments/{comment}             | update  | comments.update        |
| DELETE    | /comments/{comment}             | destroy | comments.destroy       |

*** This table was originally taken from [Laravel.com][laravel-table]
you can view the original table [here][laravel-table]
within the **#Nested Resources** section.

<!-- Identifiers, in alphabetical order -->
[laravel-site]:
https://laravel.com/
"Laravel.com"

[laravel-table]:
https://laravel.com/docs/6.x/controllers#restful-nested-resources
"Laravel Docs - Routes Table"

I use php daily with the company I co-founded.
Naturally I may develop a preference for laravel and php standards 😁


### Naming
* files - Capitalize the first letter of each word.
* folders - lowercase.
* properties - any and all properties for objects snake case - this plays better with Redis' hashing.