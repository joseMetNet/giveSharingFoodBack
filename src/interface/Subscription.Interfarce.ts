export interface ISubscription{
    idOrganization : number;
    subscriptionId : number;
    status : string;
    startDate : Date; 
    endDate : Date;
    cancelDate : Date;
};

export interface IOrderData {
    title: string;
    unit_price: number;
    currency_id: string;
    quantity: number;
  }
  
  export interface IOrderResponse {
    code: number;
    message: string | ImessageComposed | { translationKey: string },
    data?: any;
  }
  export interface ImessageComposed {
    translationKey: string,
    translationParams: object
}
  export interface IresponseRepositoryService {
    code: number;
    message: string | ImessageComposed | { translationKey: string },
    data?: any;
  }