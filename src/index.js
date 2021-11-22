import Matter from 'matter-js'


var root = document.querySelector('#root')
var canvas = document.createElement('canvas')

root.append(canvas)

var box = { width: 800, height: 600 }

let engine = Matter.Engine.create()
let render = Matter.Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: box.width,
        height: box.height,
        background: 'transparent',
        wireframeBackground: 'rgba(0, 0, 0, 0.2)',
        wireframes: false,
    }
})
const world = engine.world

Matter.Render.run(render)
let runner = Matter.Runner.create()
Matter.Runner.run(runner, engine)
Matter.Events.on(render, 'beforeRender', onBeforeRender)
Matter.Events.on(render, 'afterRender', onAfterRender)

Matter.Composite.add(world, Matter.Bodies.rectangle(400, 580, 800, 20, {
    isStatic: true
}))
Matter.Composite.add(world, Matter.Bodies.rectangle(200, 200, 100, 150, {
    isStatic: true,
    render: {
        fillStyle: '#ff0000'
    }
}))

function makeFourFeetAnimal(format) {
    /*
    var body = Matter.Bodies.polygon(150, 200, 5, 30);

    var constraint = Matter.Constraint.create({
        pointA: { x: 150, y: 100 },
        bodyB: body,
        pointB: { x: -10, y: -10 },
        render: {
            strokeStyle: '#ff0000'
        }
    });

    Matter.Composite.add(world, [body, constraint]);

    var body = Matter.Bodies.rectangle(600, 200, 200, 20);
    var constraint = Matter.Constraint.create({
        pointA: { x: 600, y: 200 },
        bodyB: body,
        length: 0
    });
    Matter.Composite.add(world, [body, constraint]);
    */

    const x = format.x
    const y = format.y
    const s = format.size

    const body = format.body || {}
    const head = body.head || 0.25
    const neck = body.neck || 0.25
    const chin = body.chin || 1.0
    const nose = body.nose || 0.4
    const chest = body.chest || 0.5
    const abdomen = body.abdomen || 0.25
    const backbone = body.backbone || 0.5
    const elbow = body.elbow || 0.2
    const wrist = body.wrist || 0.2
    const paw = body.paw || 0.05

    const ratio = {
        head: { w: 1, h: 0.8 },
        chest: { w: 1, h: 0.7 },
        neck: { w: 1, h: 0.1 }
    }
    const parts = {
        head: {x, y, width: s * ratio.head.w * head, height: s * ratio.head.h * head, options: { render: { fillStyle: '#ff0000' }}},
        neck: {x, y, width: s * ratio.neck.w * neck, height: s * ratio.neck.h * neck, options: { render: { fillStyle: '#00ff00' }}},
        chest: {x, y, width: s * ratio.chest.w * chest, height: s * ratio.chest.h * chest, options: { render: { fillStyle: '#0000ff' }}}
    }
    const joints = [
        {A: 'head', pointA: {x: -0.5, y: 0}, B: 'neck', pointB: {x: 0.5, y: 0}},
        {A: 'chest', pointA: {x: -0.3, y: -0.5}, B: 'neck', pointB: {x: -0.5, y: 0}}
    ]

    const bodies = {}
    for (let name in parts) {
        const p = parts[name]
        console.log(name, p)
        const b = Matter.Bodies.rectangle(p.x, p.y, p.width, p.height, p.options)
        Matter.Composite.add(world, b)
        bodies[name] = b
    }
    for (let i = 0; i < joints.length; i++) {
        const j = joints[i]
        const pa = parts[j.A]
        const pb = parts[j.B]
        const a = {x: j.pointA.x * pa.width, y: j.pointA.y * pa.height}
        const b = {x: j.pointB.x * pb.width, y: j.pointB.y * pb.height}
        const c = Matter.Constraint.create({
            bodyA: bodies[j.A], pointA: a,
            bodyB: bodies[j.B], pointB: b,
            length: 0
        })
        Matter.Composite.add(world, c)
    }
}

function createTree(format, wood = null, w = null) {
    let x = format.x
    let y = format.y
    let width = w || format.width
    let height = format.height
    let oldHeight = 0
    let weight = format.weight || {x: 0.75, y: 0.99}
    let branchPoint = width * (format.branchPoint || 0.6)
    let minimumSize = Math.floor(format.width * (format.minimumBranch || 0.125))
    const woods = []
    function createJoint() {
        if (wood) {
            const {min, max} = wood.bounds
            oldHeight = max.y - min.y
            x = wood.position.x
            y = wood.position.y - oldHeight / 2
            width *= weight.x
            height *= weight.y
        }
        const old = wood
        wood = Matter.Bodies.rectangle(x, y - height / 2, width, height, {
            label: 'wood',
            isStatic: !wood,
            chamfer: {
                radius: width / 5
            },
        })
        Matter.Composite.add(world, wood)
        woods.push(wood)

        if (old) {
            Matter.Composite.add(world, Matter.Constraint.create({
                bodyA: old,
                pointA: {x: 0, y: -oldHeight / 2},
                bodyB: wood,
                pointB: {x: 0, y: height / 2},
                render: {
                    type: 'pin',
                }
            }))
        }

        if (width <= branchPoint && width > minimumSize) {
            createTree(format, wood, width)
        }

        if (width > minimumSize) {
            setTimeout(createJoint, 300)
        }
        else {
            //setTimeout(() => woods.forEach(w => Matter.Body.setStatic(w, true)), 6000)
        }
    }
    createJoint()
}
createTree({ x: 300, y: 580, width: 30, height: 60, weight: {x: 0.8, y: 0.99}, branchPoint: 0.6666, minimumBranch: 0.125 })

function createForm() {

}

function onAfterRender(ev) {
}

var count = 0
function onBeforeRender(ev) {
    world.bodies.forEach(b => {
        if (b.label === 'wood' && count++ > 10) {
            Matter.Body.setVelocity(b, {x: 0, y: -4})
            count = 0
        }
    })
}

var mouse = Matter.Mouse.create(render.canvas)
var mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        // allow bodies on mouse to rotate
        angularStiffness: 0,
        render: {
            visible: false
        }
    }
});
Matter.Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;
