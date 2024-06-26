import "@devicescript/observables"
import { Potentiometer } from "@devicescript/core"
import { SSD1306Driver, startIndexedScreen } from "@devicescript/drivers"
import { HorizontalGauge, Text, renderOnImage } from "./ui"
import { auditTime, distinctUntilChanged } from "@devicescript/observables"

const pot = new Potentiometer()

export async function startPotentiometerGauge() {
    const screen = await startIndexedScreen(
        new SSD1306Driver({ width: 128, height: 64, devAddr: 0x3c })
    )

    const image = screen.image
    image.print("loading...", 0, 0)
    await screen.show()

    pot.reading
        .pipe(auditTime(50), distinctUntilChanged())
        .subscribe(async (pos: number) => {
            console.data({ pos })
            await renderOnImage(
                <>
                    <Text>Slider</Text>
                    <HorizontalGauge
                        y={12}
                        width={image.width}
                        height={12}
                        value={pos}
                        showPercent={true}
                    />
                </>,
                image
            )
            await screen.show()
        })
}
