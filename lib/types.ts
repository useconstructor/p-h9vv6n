export type Trip = {id:string;slug:string;name:string;region:string;days:number;difficulty:string;ascent:number;season:string;description:string;preparation:string;image:string;image_alt:string;image_width:number;image_height:number;focal:string;mobile_focal:string;author:string;source:string;license:string;license_url:string;verified:string};
export type Stage = {id:string;title:string;description:string;stage_order:number};
export type Receipt = {reference:string;name:string;email:string;period:string|null;message:string;trip_name:string;created_at:string};
