# Client Information

## `User` Injectable
Within the `root` state definition there is a resolver for `User`. Resolved for `User` will be a Restangular element object which can be injected anywhere throughout the application. 

The resolver for `User` makes the initial call to the `Users` (notice the s) service method, `getCurrentInit`. This request requires the presence of both an `accessTokenId` and `userID` in order to be sent out. These values will be stored in either `localStorage` or `sessionStorage` and available via the `Auth` service. The actual storage location is determined by whether `Auth.rememberMe` is set to `true` at the time of the user login. 

When the request is is made to retrieve the current user, `AuthInterceptor` will immediately reject it if `Auth.accessTokenId` is not available. In this situation, a stub response is made.

If there is a current user available, it will be returned to the resolver as a Restangular element object containing the full user information provided by Loopback. In the event that no user information is available, an empty Restangular element object will be returned to the resolver. By having both scenarios return a Restangular element object, the object can be modified and saved from anywhere it in injected.

## `UserRoles` Injectable
Upon resolver the `User` injectable, a convenience injectable `UserRoles` is made which contains an `Array` collection of each role the user is permissioned to. By default, the user has no roles and the collection is empty. This can be used injected by other services to help determine which sections of the site or features the user is able to use.  

### Anguar Dependency Injection Annotations

Preferable Usage:

* Classes
```
class SuperStar {
    constructor(SuperStarService) {
        'ngInject';
    }
}
```
* Functions
```
// @ngInject
function SomeFunction (SomeService) {
    this.doSomething = SomeService.doSomething;
}
```
