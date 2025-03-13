const Loader = () => {
    return (
        <div className="bg-black flex flex-col items-center justify-center w-full h-screen gap-2">
            <svg
                fill="#126FFF"
                width="128"
                height="128"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <circle cx="12" cy="3" r="0">
                    <animate
                        id="spinner_6RAU"
                        begin="0;spinner_GErc.end-0.5s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="16.50" cy="4.21" r="0">
                    <animate
                        id="spinner_khXL"
                        begin="spinner_6RAU.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="7.50" cy="4.21" r="0">
                    <animate
                        id="spinner_GErc"
                        begin="spinner_JEaM.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="19.79" cy="7.50" r="0">
                    <animate
                        id="spinner_9orP"
                        begin="spinner_khXL.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="4.21" cy="7.50" r="0">
                    <animate
                        id="spinner_JEaM"
                        begin="spinner_RwRf.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="21.00" cy="12.00" r="0">
                    <animate
                        id="spinner_W8J5"
                        begin="spinner_9orP.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="3.00" cy="12.00" r="0">
                    <animate
                        id="spinner_RwRf"
                        begin="spinner_tByH.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="19.79" cy="16.50" r="0">
                    <animate
                        id="spinner_tedm"
                        begin="spinner_W8J5.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="4.21" cy="16.50" r="0">
                    <animate
                        id="spinner_tByH"
                        begin="spinner_c3Lr.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="16.50" cy="19.79" r="0">
                    <animate
                        id="spinner_QxRo"
                        begin="spinner_tedm.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="7.50" cy="19.79" r="0">
                    <animate
                        id="spinner_c3Lr"
                        begin="spinner_PW3C.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
                <circle cx="12" cy="21" r="0">
                    <animate
                        id="spinner_PW3C"
                        begin="spinner_QxRo.begin+0.1s"
                        attributeName="r"
                        calcMode="spline"
                        dur="0.6s"
                        values="0;2;0"
                        keySplines=".27,.42,.37,.99;.53,0,.61,.73"
                    />
                </circle>
            </svg>
            <p className="text-lg text-primary">Chargement...</p>
        </div>
    );
};

export default Loader;
