export const GOD_PAWNS: Record<string, string> = {
  ra: '/pawns/god-ra.png',
  anubis: '/pawns/god-anubis.png',
  set: '/pawns/god-set.png',
  osiris: '/pawns/god-osiris.png',
  isis: '/pawns/god-isis.png',
  bast: '/pawns/god-bast.png',
  thoth: '/pawns/god-thoth.png',
};

export const GOD_TINT: Record<string, string> = {
  ra: 'from-[#a8741f] to-[#3a1f05]',
  anubis: 'from-[#22427a] to-[#0a0f1f]',
  set: 'from-[#8a2a1f] to-[#2a0805]',
  osiris: 'from-[#2f6b3a] to-[#0a1f0e]',
  isis: 'from-[#1f6f78] to-[#08262a]',
  bast: 'from-[#6b4a8a] to-[#1a0f26]',
  thoth: 'from-[#2a5a9e] to-[#0a1630]',
};

export const pawnFor = (godId: string) => GOD_PAWNS[godId] ?? GOD_PAWNS.ra;
