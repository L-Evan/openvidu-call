# OpenviduComponents

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.0.

## Code scaffolding

Run `ng generate component component-name --project openvidu-components` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project openvidu-components`.
> Note: Don't forget to add `--project openvidu-components` or else it will be added to the default project in your `angular.json` file.

## Build

Run `ng build openvidu-components` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build openvidu-components`, go to the dist folder `cd dist/openvidu-components` and run `npm publish`.


## Installing

Importing library module in yout `app.module.ts`

```typescript
@NgModule({
  imports: [
    BrowserModule,
    OpenviduComponentsLibraryModule.forRoot({
      environment: environment
    }),
    ...
 ]})
```


## Cosas modificar

* Quitar UtilsService y crear un servicio que se encargue de la misma tarea, como mostrar mensajes de error.
* Quitar el tema del avatar