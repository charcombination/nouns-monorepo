import {
  Container,
  Col,
  Button,
  Image,
  Row,
  FloatingLabel,
  Form,
  OverlayTrigger,
  Popover,
} from 'react-bootstrap';
import classes from './Playground.module.css';
import React, { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import Link from '../../components/Link';
//import { ImageData, getNounData, getRandomNounSeed } from 'packages/nouns-webapp/src/nounsdao-assets';
import ImageData from '../../nounsdao-assets/image-data.json';
import { getNounData, getRandomNounSeed } from '../../nounsdao-assets/utils';
import { EncodedImage } from '../../nounsdao-assets/types';
import { PNGCollectionEncoder } from '../../nounsdao-assets/png-collection-encoder';
import { buildSVG } from '../../nounsdao-assets/svg-builder';
//import { buildSVG, EncodedImage, PNGCollectionEncoder } from '@nouns/sdk';
import Noun from '../../components/Noun';
import { PNG } from 'pngjs';
import ReactSkinview3d from "react-skinview3d"
import { WalkingAnimation } from "skinview3d";
import walking from '../../assets/icons/Walking.png';
import standing from '../../assets/icons/Standing.png';
import download from '../../assets/icons/Download.png';
import ImageOverlay from '../../components/ImageOverlay';

interface Trait {
  title: string;
  traitNames: string[];
}

interface PendingCustomTrait {
  type: string;
  data: string;
  filename: string;
}



const nounsSiteLink = (
  <Link
    text="Nouns Website"
    url="https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-assets"
    leavesPage={true}
  />
);

const skinview3Dlink = (
  <Link
    text="React Skinview3D"
    url="https://github.com/Hacksore/react-skinview3d"
    leavesPage={true}
  />
);

const DEFAULT_TRAIT_TYPE = 'heads';

const encoder = new PNGCollectionEncoder(ImageData.palette);

const traitKeyToTitle: Record<string, string> = {
  heads: 'head',
  glasses: 'glasses',
  bodies: 'body',
  accessories: 'accessory',
};

const parseTraitName = (partName: string): string =>
  capitalizeFirstLetter(partName.substring(partName.indexOf('-') + 1));

const capitalizeFirstLetter = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const traitKeyToLocalizedTraitKeyFirstLetterCapitalized = (s: string): string | undefined => {
  const traitMap = new Map([
    ['background', 'Background'],
    ['body', 'Body'],
    ['accessory', 'Accessory'],
    ['head', 'Head'],
    ['glasses', 'Glasses'],
  ]);

  return traitMap.get(s);
};

const Playground: React.FC = () => {
  const [nounSvgs, setNounSvgs] = useState<string[]>();
  const [traits, setTraits] = useState<Trait[]>();
  const [modSeed, setModSeed] = useState<{ [key: string]: number }>();
  const [initLoad, setInitLoad] = useState<boolean>(true);
  const [displayNoun, setDisplayNoun] = useState<boolean>(false);
  const [indexOfNounToDisplay, setIndexOfNounToDisplay] = useState<number>();
  const [selectIndexes, setSelectIndexes] = useState<Record<string, number>>({});
  const [pendingTrait, setPendingTrait] = useState<PendingCustomTrait>();
  const [isPendingTraitValid, setPendingTraitValid] = useState<boolean>();

  const customTraitFileRef = useRef<HTMLInputElement>(null);
  const [overlay, setOverlay] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>("#d5d7e1");
  const [skinImages, setSkinImages] = useState<string[] | null>();

  function handleOverlayGenerated(base64: string | null) {
    setOverlay(base64);
  }

  function downloadBase64Image(base64: string, filename: string) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = base64;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleDownloadClick() {
    downloadBase64Image(overlay!, 'noun.png');
  }

  const generateNounSvg = React.useCallback(
    (amount: number = 1) => {
      for (let i = 0; i < amount; i++) {
        const seed = { ...getRandomNounSeed(), ...modSeed };
        const { parts, background } = getNounData(seed);
        setSkinImages(parts.map(item => item.skin))
        setColor(`#${background}`)
        console.log(parts)
        const svg = buildSVG(parts, encoder.data.palette, background);
        setNounSvgs(prev => {
          /* return prev ? [svg, ...prev] : [svg]; */
          return [svg, svg]
        });
        
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingTrait, modSeed],
  );

  useEffect(() => {
    const traitTitles = ['background', 'body', 'accessory', 'head', 'glasses'];
    const traitNames = [
      ['cool', 'warm'],
      ...Object.values(ImageData.images).map(i => {
        return i.map(imageData => imageData.filename);
      }),
    ];
    setTraits(
      traitTitles.map((value, index) => {
        return {
          title: value,
          traitNames: traitNames[index],
        };
      }),
    );

    if (initLoad) {
      generateNounSvg(2);
      setInitLoad(false);
    }
  }, [generateNounSvg, initLoad]);

  const traitOptions = (trait: Trait) => {
    return Array.from(Array(trait.traitNames.length + 1)).map((_, index) => {
      const traitName = trait.traitNames[index - 1];
      const parsedTitle = index === 0 ? `Random` : parseTraitName(traitName);
      return (
        <option key={index} value={traitName}>
          {parsedTitle}
        </option>
      );
    });
  };

  const traitButtonHandler = (trait: Trait, traitIndex: number) => {
    setModSeed(prev => {
      // -1 traitIndex = random
      if (traitIndex < 0) {
        let state = { ...prev };
        delete state[trait.title];
        return state;
      }
      return {
        ...prev,
        [trait.title]: traitIndex,
      };
    });
  };

  const resetTraitFileUpload = () => {
    if (customTraitFileRef.current) {
      customTraitFileRef.current.value = '';
    }
  };

  let pendingTraitErrorTimeout: NodeJS.Timeout;
  const setPendingTraitInvalid = () => {
    setPendingTraitValid(false);
    resetTraitFileUpload();
    pendingTraitErrorTimeout = setTimeout(() => {
      setPendingTraitValid(undefined);
    }, 5_000);
  };

  const validateAndSetCustomTrait = (file: File | undefined) => {
    if (pendingTraitErrorTimeout) {
      clearTimeout(pendingTraitErrorTimeout);
    }
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const buffer = Buffer.from(e?.target?.result!);
        const png = PNG.sync.read(buffer);
        if (png.width !== 32 || png.height !== 32) {
          throw new Error('Image must be 32x32');
        }
        const filename = file.name?.replace('.png', '') || 'custom';
        const data = encoder.encodeImage(filename, {
          width: png.width,
          height: png.height,
          rgbaAt: (x: number, y: number) => {
            const idx = (png.width * y + x) << 2;
            const [r, g, b, a] = [
              png.data[idx],
              png.data[idx + 1],
              png.data[idx + 2],
              png.data[idx + 3],
            ];
            return {
              r,
              g,
              b,
              a,
            };
          },
        });
        setPendingTrait({
          data,
          filename,
          type: DEFAULT_TRAIT_TYPE,
        });
        setPendingTraitValid(true);
      } catch (error) {
        setPendingTraitInvalid();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadCustomTrait = () => {
    const { type, data, filename } = pendingTrait || {};
    if (type && data && filename) {
      const images = ImageData.images as Record<string, EncodedImage[]>;
      images[type].unshift({
        filename,
        data,
      });
      const title = traitKeyToTitle[type];
      const trait = traits?.find(t => t.title === title);

      resetTraitFileUpload();
      setPendingTrait(undefined);
      setPendingTraitValid(undefined);
      traitButtonHandler(trait!, 0);
      setSelectIndexes({
        ...selectIndexes,
        [title]: 0,
      });
    }
  };

  return (
    <>
      <Container fluid="lg">
        <Row>
          <Col lg={10} className={classes.headerRow}>
            <span>
              Nounish Skins
            </span>
            <h1>
              Skin Builder
            </h1>
            
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <Col lg={12}>
              <Button
                onClick={() => {
                  generateNounSvg();
                }}
                className={classes.primaryBtn}
              >
                Generate Noun
              </Button>
            </Col>
            <Row>
              {traits &&
                traits.map((trait, index) => {
                  return (
                    <Col lg={12} xs={6}>
                      <Form className={classes.traitForm}>
                        <FloatingLabel
                          controlId="floatingSelect"
                          label={traitKeyToLocalizedTraitKeyFirstLetterCapitalized(trait.title)}
                          key={index}
                          className={classes.floatingLabel}
                        >
                          <Form.Select
                            aria-label="Floating label select example"
                            className={classes.traitFormBtn}
                            value={trait.traitNames[selectIndexes?.[trait.title]] ?? -1}
                            onChange={e => {
                              let index = e.currentTarget.selectedIndex;
                              traitButtonHandler(trait, index - 1); // - 1 to account for 'random'
                              setSelectIndexes({
                                ...selectIndexes,
                                [trait.title]: index - 1,
                              });
                            }}
                          >
                            {traitOptions(trait)}
                          </Form.Select>
                        </FloatingLabel>
                      </Form>
                    </Col>
                  );
                })}
            </Row>
          </Col>
          <Col lg={9}>
            <Row>
              {nounSvgs &&
                nounSvgs.map((svg, i) => {
                  return (
                    <Col xs={6} lg={6} key={i}>
                      {i % 2 === 0 ? (
                        <div
                        onClick={() => {
                          setIndexOfNounToDisplay(i);
                          setDisplayNoun(true);
                        }}
                        >
                          <Noun
                          imgPath={`data:image/svg+xml;base64,${btoa(svg)}`}
                          alt="noun"
                          className={classes.nounImg}
                          wrapperClassName={classes.nounWrapper}
                          />
                        </div>
                      ) : (
                        <div className={classes.canvaswrapper} style={{backgroundColor: `${color}`}}
                        >
                          { skinImages &&
                          <ImageOverlay 
                            images={skinImages}
                            onOverlayGenerated={handleOverlayGenerated}
                          />
                          }

                          {
                            overlay &&
                            <ReactSkinview3d
                            className="viewer"
                            skinUrl={overlay}
                            height={400}
                            width={400}
                            onReady={({ viewer }) => {
                              viewer.autoRotate = false;
                              viewer.fov = 36;
                              viewer.controls.enablePan = false;
                              viewer.controls.enableRotate = false;
                              viewer.controls.enableZoom = false;

                              viewer.camera.position.x = 27.5;
                              viewer.camera.position.y = 22.5;
                              viewer.camera.position.z = 52.0;

                              viewer.animation = new WalkingAnimation();
                              viewer.animation.speed = 0.7;
                            }}
                          />
                          }

                          <button className={classes.download} onClick={handleDownloadClick}>
                            <img src={download} alt="Download" />
                          </button>

                          <button className={classes.movement}>
                            <img src={walking} alt="Toggle Movement" />
                          </button>
                        </div>
                      )}
                      
                    </Col>
                  );
                })}
            </Row>
          </Col>
        </Row>
        <p className={classes.comment}>
            This site generates Minecraft skins based on Nouns, a generative NFT project. The avatars and skins are in the public domain. 
            The project was built based on the open-source {nounsSiteLink}, the skins are rendered with {skinview3Dlink}.
        </p>
      </Container>
      
    </>
  );
};
export default Playground;
