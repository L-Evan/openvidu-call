import { Inject, Injectable } from '@angular/core';
import { LibConfig } from '../../config/lib.config';

@Injectable()
export class LibraryConfigService {
	private configuration: LibConfig;

	constructor(@Inject('LIB_CONFIG') config: LibConfig) {
		this.configuration = config;
		console.log(this.configuration);
	}

	getConfig(): LibConfig {
		return this.configuration;
	}
	isProduction(): boolean {
		return this.configuration?.environment?.production;
	}
}
