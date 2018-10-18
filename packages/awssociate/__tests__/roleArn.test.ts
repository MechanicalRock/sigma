import { roleArn } from "../lib/role"

describe('roleArn', () => {
  it('should build an arn from the given parts', () => {

    let roleArn2 = roleArn('1234567', 'myRole')

    expect(roleArn2).toEqual('arn:aws:iam::1234567:role/myRole')

  })

  it('should build an arn with a non-root path', () => {

    let roleArn2 = roleArn('1234567', 'myfoo/myRole')

    expect(roleArn2).toEqual('arn:aws:iam::1234567:role/myfoo/myRole')
    
  })
  
  it('should strip leading slashes for non-root paths', () => {
    let roleArn2 = roleArn('1234567', '/myfoo/myRole')
    expect(roleArn2).toEqual('arn:aws:iam::1234567:role/myfoo/myRole')
  })
})