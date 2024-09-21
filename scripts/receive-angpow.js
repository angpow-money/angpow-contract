async function main() {
  const Angpow = await ethers.getContractFactory("AngpowContract");
  const angpow = Angpow.attach(process.env.ANGPOW);
  const sig = await angpow.receiveAngpow(
    1,
    "0x261914D11434Becc57dE7BBE8C82551B648E510f"
  )
  console.log(sig)
}

main()

