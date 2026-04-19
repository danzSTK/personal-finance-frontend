export const CURRENCY_MASK = {
  mask: 'R$ num',
  blocks: {
    num: {
      mask: Number,
      scale: 2,
      signed: false,
      thousandsSeparator: '.',
      radix: ',',
      mapToRadix: ['.'],
      padFractionalZeros: true,
      normalizeZeros: true,
    },
  },
}

export const CPF_MASK = '000.000.000-00'

export const PHONE_MASK = [
  {
    mask: '(00) 0000-0000',
  },
  {
    mask: '(00) 00000-0000',
  },
]

export const CEP_MASK = '00000-000'

export const DATE_MASK = '00/00/0000'
