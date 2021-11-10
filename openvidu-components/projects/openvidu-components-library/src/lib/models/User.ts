export class UserModel {
	name: string = '';

	constructor() {
		this.name = 'name parent';
	}
	public getName() : string {
		return this.name;
	}

}