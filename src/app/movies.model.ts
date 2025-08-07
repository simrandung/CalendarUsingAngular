
import { Moment } from 'moment';

export interface MovieReleaseEvent {
  id?: number;
  title: string;
  releaseDateTime: Moment;
  description?: string;
}
