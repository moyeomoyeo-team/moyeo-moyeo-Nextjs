import { useRef } from 'react';

export const usePrevious = <T>(value: T) => {
  // initialize the ref with previous and current values
  const ref = useRef<{ value: T; prev: T | null }>({
    value: value,
    prev: null,
  });

  const current = ref.current.value;

  // if the value passed into hook doesn't match what we store as "current"
  // move the "current" to the "previous"
  // and store the passed value as "current"
  if (value !== current) {
    ref.current = {
      value: value,
      prev: current,
    };
  }

  // return the previous value only
  return ref.current.prev;
};
