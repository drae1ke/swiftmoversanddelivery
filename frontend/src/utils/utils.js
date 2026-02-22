export const mkInitials = (name) => {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
};

export const nid = (() => {
  let _id = 0;
  return () => `a${++_id}`;
})();