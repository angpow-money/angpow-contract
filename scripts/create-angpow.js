const tokenAmount = ethers.parseEther("0.00001");

async function main() {
  const Angpow = await ethers.getContractFactory("AngpowContract");
  const angpow = Angpow.attach("0x353fCB9FE729a892E9716fcC142262d7635DFF6f");
  const sig = await angpow.createAngpow(
    1,
    ethers.ZeroAddress,
    tokenAmount,
    1,
    { value: tokenAmount }
  )
  console.log(sig)
}

main()
