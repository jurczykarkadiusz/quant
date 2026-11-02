import quantJson from '../../public/quant_results.json';
import { QuantDataset } from '../types/quant';

export const defaultQuantData: QuantDataset = quantJson as unknown as QuantDataset;
