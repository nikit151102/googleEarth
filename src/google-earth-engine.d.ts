declare module '@google/earthengine' {
    export class Image {
      constructor(id?: string);
      select(band: string): Image;
      lt(value: number): Image;
      mask(): Image;
      updateMask(mask: Image): Image;
      and(image: Image): Image;
      not(): Image;
    }

    export class ImageCollection {
      constructor(id: string);
      filter(filter: any): ImageCollection;
      mean(): Image;
      select(band: string): ImageCollection;
      map(callback: (image: Image) => Image): ImageCollection;
    }
  
    export class Filter {
      static date(start: string, end: string): Filter;
      static eq(property: string, value: any): Filter;
      static listContains(property: string, value: any): Filter;
    }
  
    export const ee: {
      Image: typeof Image;
      ImageCollection: typeof ImageCollection;
      Filter: typeof Filter;
      cat: (...images: Image[]) => Image;
      initialize: (args?: any) => void;
      data: {
        getMapId(image: Image): { mapid: string };
      };
    };
  }
  declare var gapi: any;
