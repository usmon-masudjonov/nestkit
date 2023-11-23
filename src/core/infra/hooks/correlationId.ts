import * as cls from 'cls-hooked';
import { v4 as uuid } from 'uuid';

const store = cls.createNamespace<Record<string, string>>('correlationId');

const CHAIN_ID = 'CHAIN_ID';

function withCorrelationId(fn: CallableFunction, correlationId: string) {
  store.run(() => {
    store.set(CHAIN_ID, correlationId || uuid());
    fn();
  });
}

function getCorrelationId(): string {
  return store.get(CHAIN_ID);
}

export const correlationIdProvider = {
  withCorrelationId,
  getCorrelationId,
  bindEmitter: store.bindEmitter.bind(store),
  bind: store.bind.bind(store),
};
