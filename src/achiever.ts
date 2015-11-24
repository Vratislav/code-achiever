export interface Achiever{
	name : string
	type : string
	metrics : {[index:string] : any}
	achievments : {[index:string] : string}	
	save():Promise<Achiever>
}