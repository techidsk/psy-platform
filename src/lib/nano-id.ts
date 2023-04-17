import { customAlphabet } from 'nanoid'


export function getId() {
    const nanoid = customAlphabet('1234567890abcdef', 16)
    return nanoid()
}