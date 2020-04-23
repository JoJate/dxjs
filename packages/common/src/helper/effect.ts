/* eslint-disable @typescript-eslint/no-explicit-any */
import { TAKE_EVERY, EFFECT_METHODS_META, SymbolType, EFFECT_HELPERS, EFFECT_METHODS_KEY } from '@dxjs/shared/symbol';
import { EffectTypeInterface } from '@dxjs/shared/interfaces/dx-effect-type.interface';

export function Effect(actionType?: SymbolType, helperType?: SymbolType, ...args: any[]): MethodDecorator {
  /**
   * 参数替换：
   * @Effect()
   * @Effect(TakeEvery)
   * @Effect("actionType", TakeEvery)
   * @Effect(Throttle, 350)
   * @Effect("actionType", Throttle, 350)
   */
  const _defaultActionType = Symbol('__action_type');
  let _actionType = actionType ?? _defaultActionType;
  let _helperType = helperType ?? TAKE_EVERY;
  if (EFFECT_HELPERS.includes(_actionType)) {
    if (helperType) args.unshift(helperType);
    [_actionType, _helperType] = [_defaultActionType, _actionType];
  }

  return (target: any, key: SymbolType, descriptor: TypedPropertyDescriptor<any>): TypedPropertyDescriptor<any> => {
    // eslint-disable-next-line prettier/prettier

    const effectKeys: Set<SymbolType> = Reflect.getMetadata(EFFECT_METHODS_KEY, target.constructor) ?? new Set();
    if (effectKeys.has(key)) return descriptor;

    const effectMetas: Set<EffectTypeInterface> = Reflect.getMetadata(EFFECT_METHODS_META, target.constructor) ?? new Set();
    effectMetas.add({
      name: key,
      value: args,
      helperType: _helperType,
      actionType: _actionType,
    });
    effectKeys.add(key);
    Reflect.defineMetadata(EFFECT_METHODS_KEY, effectKeys, target.constructor);
    Reflect.defineMetadata(EFFECT_METHODS_META, effectMetas, target.constructor);
    return descriptor;
  };
}
