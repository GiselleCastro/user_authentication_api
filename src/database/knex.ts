import knex from 'knex';
import { constants } from '../config/constants';
import * as config from '../../knexfile';
const { ENVIRONMENT_ENV } = constants;

//@ts-expect-error ENV
export const db = knex(config[ENVIRONMENT_ENV]);
