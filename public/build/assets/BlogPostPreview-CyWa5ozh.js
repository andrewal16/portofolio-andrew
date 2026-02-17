import{c as Z,j as t,r as ee,s as G}from"./app-B6r_TxPj.js";import{A as te}from"./app-layout-D7rl8n8V.js";import{A as ne}from"./index-BNY9YUcc.js";import{T as J}from"./index-y3Adf1Mc.js";import{T as oe,S as q}from"./index-BZ9BXEnJ.js";import{R as le}from"./ArrowLeftOutlined-4PfLy0gN.js";import{B as O}from"./ContextIsolator-Bw6ExzQV.js";import{R as Q}from"./EyeOutlined-CM2hfqon.js";import{R as ie}from"./FolderOutlined-DZ6WVcFr.js";import{R as re}from"./CalendarOutlined-Cyrma7M4.js";import{D as X}from"./index-BLHpURQ3.js";import{C as se}from"./index-DbKJ5h10.js";import"./app-CbEWB9i-.js";import"./render-DbXmZ5EJ.js";import"./AntdIcon-CfDRJjfZ.js";import"./SafetyCertificateOutlined-DbWOw5Tm.js";import"./RocketOutlined-DIEW3gEz.js";import"./InfoCircleFilled-CRePx94_.js";import"./CloseOutlined-CdTwbbfa.js";import"./useClosable-BnFp-AKn.js";import"./CheckOutlined-0PrG8dNn.js";import"./Skeleton-BCZumm4n.js";import"./PlusOutlined-BILouNqv.js";const{Title:ae,Text:K}=oe;function Ie(Y){const e=Z.c(67),{project:o,blogPost:n}=Y;let _,j;e[0]===Symbol.for("react.memo_cache_sentinel")?(_={maxWidth:"1200px",margin:"0 auto"},j={marginBottom:"24px"},e[0]=_,e[1]=j):(_=e[0],j=e[1]);let k;e[2]===Symbol.for("react.memo_cache_sentinel")?(k=t.jsx(le,{}),e[2]=k):k=e[2];let l;e[3]!==n.slug?(l=t.jsx(O,{icon:k,onClick:()=>ee.visit(G("admin.blog-posts.edit",n.slug)),children:"Kembali ke Edit"}),e[3]=n.slug,e[4]=l):l=e[4];let S;e[5]===Symbol.for("react.memo_cache_sentinel")?(S=t.jsx(Q,{}),e[5]=S):S=e[5];let i;e[6]!==n.is_published||e[7]!==n.slug||e[8]!==o.slug?(i=()=>{n.is_published&&window.open(G("projects.blog-posts.show",{project:o.slug,blogPost:n.slug}),"_blank")},e[6]=n.is_published,e[7]=n.slug,e[8]=o.slug,e[9]=i):i=e[9];const U=!n.is_published;let r;e[10]!==i||e[11]!==U?(r=t.jsx(O,{type:"primary",icon:S,onClick:i,disabled:U,children:"Lihat Live Version"}),e[10]=i,e[11]=U,e[12]=r):r=e[12];let s;e[13]!==l||e[14]!==r?(s=t.jsx("div",{style:j,children:t.jsxs(q,{children:[l,r]})}),e[13]=l,e[14]=r,e[15]=s):s=e[15];let a;e[16]!==n.is_published?(a=!n.is_published&&t.jsx(ne,{message:"Mode Preview - Draft",description:"Blog post ini masih dalam status draft dan belum bisa diakses publik. Publish terlebih dahulu untuk membagikan ke publik.",type:"warning",showIcon:!0,style:{marginBottom:"24px"}}),e[16]=n.is_published,e[17]=a):a=e[17];let w,v,z,R;e[18]===Symbol.for("react.memo_cache_sentinel")?(w=t.jsxs(q,{children:[t.jsx(Q,{}),t.jsx(K,{strong:!0,children:"Preview Blog Post"})]}),v={boxShadow:"0 2px 12px rgba(0,0,0,0.08)",borderRadius:"12px",overflow:"hidden"},z={padding:0},R={background:"linear-gradient(135deg, #667eea 0%, #764ba2 100%)",padding:"48px 48px 32px",color:"white"},e[18]=w,e[19]=v,e[20]=z,e[21]=R):(w=e[18],v=e[19],z=e[20],R=e[21]);let B;e[22]===Symbol.for("react.memo_cache_sentinel")?(B={marginBottom:"16px"},e[22]=B):B=e[22];let T;e[23]===Symbol.for("react.memo_cache_sentinel")?(T=t.jsx(ie,{}),e[23]=T):T=e[23];let A;e[24]===Symbol.for("react.memo_cache_sentinel")?(A={color:"white",border:"1px solid rgba(255,255,255,0.3)",fontSize:"14px",padding:"4px 12px"},e[24]=A):A=e[24];let c;e[25]!==o.title?(c=t.jsx(J,{icon:T,color:"rgba(255,255,255,0.2)",style:A,children:o.title}),e[25]=o.title,e[26]=c):c=e[26];let m;e[27]!==n.is_published?(m=!n.is_published&&t.jsx(J,{color:"orange",style:{fontSize:"14px",padding:"4px 12px"},children:"DRAFT"}),e[27]=n.is_published,e[28]=m):m=e[28];let d;e[29]!==c||e[30]!==m?(d=t.jsxs(q,{style:B,children:[c,m]}),e[29]=c,e[30]=m,e[31]=d):d=e[31];let P;e[32]===Symbol.for("react.memo_cache_sentinel")?(P={color:"white",margin:0,fontSize:"42px",fontWeight:700,lineHeight:1.2},e[32]=P):P=e[32];let f;e[33]!==n.title?(f=t.jsx(ae,{level:1,style:P,children:n.title}),e[33]=n.title,e[34]=f):f=e[34];let I,C;e[35]===Symbol.for("react.memo_cache_sentinel")?(I={marginTop:"16px",opacity:.9},C=t.jsx(re,{}),e[35]=I,e[36]=C):(I=e[35],C=e[36]);let D;e[37]===Symbol.for("react.memo_cache_sentinel")?(D={color:"white"},e[37]=D):D=e[37];const V=n.published_at?`Dipublikasikan ${n.published_at}`:"Belum dipublikasikan";let p;e[38]!==V?(p=t.jsxs(q,{style:I,children:[C,t.jsx(K,{style:D,children:V})]}),e[38]=V,e[39]=p):p=e[39];let b;e[40]!==d||e[41]!==f||e[42]!==p?(b=t.jsxs("div",{style:R,children:[d,f,p]}),e[40]=d,e[41]=f,e[42]=p,e[43]=b):b=e[43];let $,H;e[44]===Symbol.for("react.memo_cache_sentinel")?($=t.jsx(X,{style:{margin:0}}),H={padding:"48px",background:"white"},e[44]=$,e[45]=H):($=e[44],H=e[45]);let g;e[46]!==n.content?(g={__html:n.content},e[46]=n.content,e[47]=g):g=e[47];let L;e[48]===Symbol.for("react.memo_cache_sentinel")?(L={fontSize:"18px",lineHeight:"1.8",color:"#2c3e50"},e[48]=L):L=e[48];let h;e[49]!==g?(h=t.jsx("div",{className:"blog-content",dangerouslySetInnerHTML:g,style:L}),e[49]=g,e[50]=h):h=e[50];let N,E;e[51]===Symbol.for("react.memo_cache_sentinel")?(N=t.jsx(X,{style:{marginTop:"48px",marginBottom:"24px"}}),E={textAlign:"center"},e[51]=N,e[52]=E):(N=e[51],E=e[52]);let M;e[53]===Symbol.for("react.memo_cache_sentinel")?(M={color:"#1890ff"},e[53]=M):M=e[53];let x;e[54]!==o.title?(x=t.jsx("div",{style:E,children:t.jsxs(K,{type:"secondary",children:["Artikel ini merupakan bagian dari project"," ",t.jsx(K,{strong:!0,style:M,children:o.title})]})}),e[54]=o.title,e[55]=x):x=e[55];let u;e[56]!==h||e[57]!==x?(u=t.jsxs("div",{style:H,children:[h,N,x]}),e[56]=h,e[57]=x,e[58]=u):u=e[58];let y;e[59]!==b||e[60]!==u?(y=t.jsxs(se,{title:w,style:v,bodyStyle:z,children:[b,$,u]}),e[59]=b,e[60]=u,e[61]=y):y=e[61];let F;e[62]===Symbol.for("react.memo_cache_sentinel")?(F=t.jsx("style",{children:`
                    .blog-content {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    }

                    .blog-content h1, .blog-content h2, .blog-content h3,
                    .blog-content h4, .blog-content h5, .blog-content h6 {
                        color: #1a202c;
                        font-weight: 700;
                        margin-top: 2em;
                        margin-bottom: 0.75em;
                        line-height: 1.3;
                    }

                    .blog-content h1 { font-size: 2.25em; }
                    .blog-content h2 { font-size: 1.875em; }
                    .blog-content h3 { font-size: 1.5em; }
                    .blog-content h4 { font-size: 1.25em; }

                    .blog-content > h1:first-child,
                    .blog-content > h2:first-child,
                    .blog-content > h3:first-child {
                        margin-top: 0;
                    }

                    .blog-content p {
                        margin-bottom: 1.5em;
                        line-height: 1.8;
                    }

                    .blog-content a {
                        color: #1890ff;
                        text-decoration: none;
                        border-bottom: 1px solid transparent;
                        transition: border-color 0.3s;
                    }

                    .blog-content a:hover {
                        border-bottom-color: #1890ff;
                    }

                    .blog-content ul, .blog-content ol {
                        margin-bottom: 1.5em;
                        padding-left: 2em;
                    }

                    .blog-content li {
                        margin-bottom: 0.5em;
                        line-height: 1.8;
                    }

                    .blog-content blockquote {
                        margin: 2em 0;
                        padding: 1em 1.5em;
                        background: #f9fafb;
                        border-left: 4px solid #1890ff;
                        font-style: italic;
                        color: #4a5568;
                    }

                    .blog-content pre {
                        background: #2d3748;
                        color: #e2e8f0;
                        padding: 1.5em;
                        border-radius: 8px;
                        overflow-x: auto;
                        margin: 1.5em 0;
                        font-family: 'Courier New', monospace;
                        font-size: 0.9em;
                        line-height: 1.6;
                    }

                    .blog-content code {
                        background: #f1f5f9;
                        color: #e53e3e;
                        padding: 0.2em 0.4em;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        font-size: 0.9em;
                    }

                    .blog-content pre code {
                        background: transparent;
                        color: inherit;
                        padding: 0;
                    }

                    .blog-content img {
                        max-width: 100%;
                        height: auto;
                        border-radius: 8px;
                        margin: 2em 0;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                    }

                    .blog-content table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 2em 0;
                        font-size: 0.95em;
                    }

                    .blog-content table th,
                    .blog-content table td {
                        padding: 12px 16px;
                        text-align: left;
                        border: 1px solid #e2e8f0;
                    }

                    .blog-content table th {
                        background: #f7fafc;
                        font-weight: 600;
                        color: #2d3748;
                    }

                    .blog-content table tr:hover {
                        background: #f9fafb;
                    }

                    .blog-content hr {
                        border: none;
                        border-top: 2px solid #e2e8f0;
                        margin: 3em 0;
                    }

                    .blog-content strong {
                        font-weight: 700;
                        color: #1a202c;
                    }

                    @media (max-width: 768px) {
                        .blog-content {
                            font-size: 16px;
                        }
                        .blog-content h1 { font-size: 1.75em; }
                        .blog-content h2 { font-size: 1.5em; }
                        .blog-content h3 { font-size: 1.25em; }
                    }
                `}),e[62]=F):F=e[62];let W;return e[63]!==a||e[64]!==y||e[65]!==s?(W=t.jsx(te,{children:t.jsxs("div",{style:_,children:[s,a,y,F]})}),e[63]=a,e[64]=y,e[65]=s,e[66]=W):W=e[66],W}export{Ie as default};
