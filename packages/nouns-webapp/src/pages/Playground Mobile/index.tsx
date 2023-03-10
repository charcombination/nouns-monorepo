import {
  Container,
  Col,
  Button,
  Row,
  FloatingLabel,
  Form,
} from 'react-bootstrap';
import classes from './PlaygroundMobile.module.css';
import React, { useEffect, useRef, useState } from 'react';
import Link from '../../components/Link';
import ImageData from '../../nounsdao-assets/image-data.json';
import { getNounData, getRandomNounSeed } from '../../nounsdao-assets/utils';
import { PNGCollectionEncoder } from '../../nounsdao-assets/png-collection-encoder';
import { buildSVG } from '../../nounsdao-assets/svg-builder';
import Noun from '../../components/Noun';
import ReactSkinview3d from "react-skinview3d"
import { WalkingAnimation } from "skinview3d";
import { IdleAnimation } from "skinview3d";
import walking from '../../assets/icons/Walking.png';
import standing from '../../assets/icons/Standing.png';
import download from '../../assets/icons/Download.png';
import ImageOverlay from '../../components/ImageOverlay';
import { SkinViewer } from "skinview3d";
import { externalURL, ExternalURL } from '../../utils/externalURL';
import { isMobileScreen } from '../../utils/isMobile';

interface Trait {
  title: string;
  traitNames: string[];
}

const nounsSiteLink = externalURL(ExternalURL.nouns);
const skinviewSiteLink = externalURL(ExternalURL.reactskinview);

const nounsLink = <Link text="Nouns Website" url={nounsSiteLink} leavesPage={true}/>;
const skinview3dLink = <Link text="React Skinview3D" url={skinviewSiteLink} leavesPage={true}/>


const encoder = new PNGCollectionEncoder(ImageData.palette);

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
  const [selectIndexes, setSelectIndexes] = useState<Record<string, number>>({});

  const [overlay, setOverlay] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>("#d5d7e1");
  const [skinImages, setSkinImages] = useState<string[] | null>();
  const [moving, setMoving] = useState<boolean>(true);

  const viewerRef = useRef<SkinViewer>();

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

  function toggleMovement() {
    setMoving(!moving);

    if (!viewerRef.current) return;
    viewerRef.current.animation = moving ? new IdleAnimation() : new WalkingAnimation();
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
    [modSeed],
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
                className={classes.primaryBtnM}
              >
                Generate Noun
              </Button>
            </Col>
            <Row className={classes.selection}>
              {traits &&
                traits.map((trait, index) => {
                  return (
                    <Col lg={12} xs={4}>
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
                    <Col xs={12} lg={6} key={i}>
                      {i % 2 === 1 ? (
                        <Noun
                          imgPath={`data:image/svg+xml;base64,${btoa(svg)}`}
                          alt="noun"
                          className={classes.nounImg}
                          wrapperClassName={classes.nounWrapper}
                        />
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
                            height={475}
                            width={475}
                            onReady={({ viewer }) => {
                              viewer.autoRotate = false;
                              viewer.fov = 36;
                              viewer.controls.enablePan = false;
                              viewer.controls.enableRotate = false;
                              viewer.controls.enableZoom = false;

                              viewer.camera.position.x = 27.5;
                              viewer.camera.position.y = 22.5;
                              viewer.camera.position.z = 52.0;

                              viewerRef.current = viewer;
                              viewer.animation = new WalkingAnimation();
                              viewer.animation.speed = 0.7;
                            }}
                          />
                          }

                          <button className={classes.download} onClick={handleDownloadClick}>
                            <img src={download} alt="Download" />
                          </button>

                          <button className={classes.movement} onClick={toggleMovement}>
                            <img src={moving ? walking : standing} alt="Toggle Movement" />
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
          This is a collection of nounish-themed skins for Minecraft. The Nouns and skins are in the public domain. 
          The project was built based on the open-source {nounsLink}, the skins are rendered with {skinview3dLink}.
        </p>
      </Container>
      
    </>
  );
};
export default Playground;
